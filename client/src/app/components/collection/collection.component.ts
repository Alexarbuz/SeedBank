import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeedService } from '../../services/seed.service';
import { Seed } from '../../models/seed.model';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SpecieService } from '../../services/specie.service';
import { RedbookService } from '../../services/redbook.service';
import { PlaceOfCollectionService } from '../../services/placeofcollection.service';
import { Specie } from '../../models/specie.model';
import { RedBook, PlaceOfCollection } from '../../models/seed.model';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-collection',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss']
})
export class CollectionComponent implements OnInit {
  seeds: Seed[] = [];
  loading = true;
  error = '';
  editorForm: FormGroup;
  editingSeed: Seed | null = null;
  isEditing = false;
  pageSize: number = 10;          // сколько строк показывать на странице
  currentPage: number = 1;        // текущий номер страницы

  // фильтры и сортировка
  filters: { [key: string]: string } = {};
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' | null = null;
  filterToggles: { [key: string]: boolean } = {};
  searchTerm: string = '';
  selectedImageFile: File | null = null;
  selectedXrayFile: File | null = null;

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
      this.selectedImageFile = file;
    }
  }
  species: Specie[] = [];
  redBooksRF: RedBook[] = [];
  redBooksSO: RedBook[] = [];
  places: PlaceOfCollection[] = [];

  constructor(
    private seedService: SeedService,
    private specieService: SpecieService,
    private redbookService: RedbookService,
    private placeofcollectionService: PlaceOfCollectionService,
    public auth: AuthService,
    private fb: FormBuilder,
    private el: ElementRef
  ) {
    this.editorForm = this.fb.group({
      seed_name: ['', Validators.required],
      specie_id: [null, Validators.required],
      completed_seeds: ['', Validators.required],
      seed_germination: ['', Validators.required],
      seed_moisture: ['', Validators.required],
      gpsaltitude: ['', Validators.required],
      gpslongitude: ['', Validators.required],
      gpslatitude: ['', Validators.required],
      weight_of1000seeds: ['', Validators.required],
      date_of_collection: ['', Validators.required],
      number_of_seeds: [0, [Validators.required, Validators.min(1)]],
      comment: ['', Validators.required],
      image: [''],
      red_book_rf_id: [null, Validators.required],
      red_book_so_id: [null, Validators.required],
      place_of_collection_id: [null, Validators.required],
    });
  }

  ngOnInit() {
    this.loadSeeds();
    this.specieService.getAll().subscribe(data => this.species = data);
    this.redbookService.getAll().subscribe(data => { this.redBooksRF = data; this.redBooksSO = data; });
    this.placeofcollectionService.getAll().subscribe(data => this.places = data);
    ['specie','genus','family','redBookRF','redBookSO','place'].forEach(c => this.filterToggles[c] = false);
  }

  // Обработчик кликов вне области фильтров
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.isClickInsideFilterElement(event)) {
      this.closeAllFilters();
    }
  }
    private getProcessedSeeds(): Seed[] {
    let res = [...this.seeds];
    // Поиск
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      res = res.filter(s => s.seed_name.toLowerCase().includes(term));
    }
    // Фильтры
    Object.entries(this.filters).forEach(([k, v]) => {
      res = res.filter(s => {
        const val = {
          specie: s.Specie.name_of_specie,
          genus: s.Specie.Genus.name_of_genus,
          family: s.Specie.Genus.Family.name_of_family,
          redBookRF: s.RedBookRF.category,
          redBookSO: s.RedBookSO.category,
          place: s.PlaceOfCollection.place_of_collection
        }[k];
        return val === v;
      });
    });
        if (this.sortColumn && this.sortDirection) {
      res.sort((a, b) => {
        const av = this.getSortValue(a, this.sortColumn!);
        const bv = this.getSortValue(b, this.sortColumn!);
        return av < bv
          ? (this.sortDirection === 'asc' ? -1 : 1)
          : av > bv
            ? (this.sortDirection === 'asc' ? 1 : -1)
            : 0;
      });
    }

    return res;
  }
   // Метод, который возвращает только те элементы, что попадут на текущую страницу
  get paginatedSeeds(): Seed[] {
    const all = this.getProcessedSeeds();
    const start = (this.currentPage - 1) * this.pageSize;
    return all.slice(start, start + this.pageSize);
  }

  // Узнаём общее число страниц
  get totalPages(): number {
    const totalItems = this.getProcessedSeeds().length;
    return Math.ceil(totalItems / this.pageSize) || 1;
  }

  // Переход на предыдущую страницу
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // Переход на следующую страницу
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // Устанавливаем конкретную страницу (например, при клике на номер)
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  applyFilter(column: string, value: string, event: MouseEvent) {
    event.stopPropagation();
    if (value) this.filters[column] = value;
    else delete this.filters[column];
    this.filterToggles[column] = false;
    this.currentPage = 1; // сбрасываем на первую страницу при изменении фильтров
  }

  setSort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc'
        ? 'desc'
        : this.sortDirection === 'desc'
          ? null
          : 'asc';
      if (!this.sortDirection) this.sortColumn = null;
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.currentPage = 1; // сбрасываем на первую страницу при изменении сортировки
  }

  // Проверяем, был ли клик внутри фильтра
  private isClickInsideFilterElement(event: MouseEvent): boolean {
    const headerElements = this.el.nativeElement.querySelectorAll('.header-cell');
    const dropdownElements = this.el.nativeElement.querySelectorAll('.dropdown');
    
    for (let i = 0; i < headerElements.length; i++) {
      if (headerElements[i].contains(event.target as Node)) {
        return true;
      }
    }
    
    for (let i = 0; i < dropdownElements.length; i++) {
      if (dropdownElements[i].contains(event.target as Node)) {
        return true;
      }
    }
    
    return false;
  }

  // Закрываем все фильтры
  closeAllFilters() {
    Object.keys(this.filterToggles).forEach(key => {
      this.filterToggles[key] = false;
    });
  }

  loadSeeds() {
    this.loading = true;
    this.seedService.getAll().subscribe({
      next: data => {
        this.seeds = this.auth.isLoggedIn() ? data : data.slice(0, 9);
        this.loading = false;
      },
      error: () => {
        this.error = 'Ошибка загрузки семян';
        this.loading = false;
      }
    });
  }

  isAdmin(): boolean {
    return this.auth.getUserRole() === 'ADMIN';
  }

  toggleFilter(column: string, event: MouseEvent) {
    event.stopPropagation();
    const wasOpen = this.filterToggles[column];
    this.closeAllFilters();
    this.filterToggles[column] = !wasOpen;
  }

  getUniqueValues(column: string): string[] {
    const vals = this.seeds.map(s => {
      switch (column) {
        case 'family':    return s.Specie.Genus.Family.name_of_family;
        case 'genus':     return s.Specie.Genus.name_of_genus;
        case 'specie':    return s.Specie.name_of_specie;
        case 'place':     return s.PlaceOfCollection.place_of_collection;
        case 'redBookRF': return s.RedBookRF.category;
        case 'redBookSO': return s.RedBookSO.category;
        default:          return '';
      }
    });
    return Array.from(new Set(vals)).sort();
  }

  onSearchChange() {
    this.currentPage = 1;
  }

  getSortValue(seed: Seed, column: string): any {
    switch (column) {
      case 'completed_seeds':    return seed.completed_seeds;
      case 'seed_germination':   return seed.seed_germination;
      case 'seed_moisture':      return seed.seed_moisture;
      case 'gpsaltitude':        return seed.gpsaltitude;
      case 'gpslongitude':       return seed.gpslongitude;
      case 'gpslatitude':        return seed.gpslatitude;
      case 'weight_of1000seeds': return seed.weight_of1000seeds;
      case 'number_of_seeds':    return seed.number_of_seeds;
      case 'date_of_collection': return new Date(seed.date_of_collection);
      default:                   return '';
    }
  }

  getFilteredAndSortedSeeds(): Seed[] {
    let res = [...this.seeds];
    // Поиск
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      res = res.filter(s => s.seed_name.toLowerCase().includes(term));
    }
    // Фильтры
    Object.entries(this.filters).forEach(([k,v]) => {
      res = res.filter(s => {
        const val = {
          specie: s.Specie.name_of_specie,
          genus: s.Specie.Genus.name_of_genus,
          family: s.Specie.Genus.Family.name_of_family,
          redBookRF: s.RedBookRF.category,
          redBookSO: s.RedBookSO.category,
          place: s.PlaceOfCollection.place_of_collection
        }[k];
        return val === v;
      });
    });
    // Сортировка
    if (this.sortColumn && this.sortDirection) {
      res.sort((a,b) => {
        const av = this.getSortValue(a,this.sortColumn!);
        const bv = this.getSortValue(b,this.sortColumn!);
        return av < bv ? (this.sortDirection==='asc'? -1:1)
                      : av > bv ? (this.sortDirection==='asc'? 1:-1)
                      : 0;
      });
    }
    return res;
  }

  // Позиционирование выпадающего списка
  getDropdownPosition(column: string): { x: number, y: number } {
    const headers: NodeListOf<HTMLElement> = this.el.nativeElement.querySelectorAll('th.header-cell');
    const mapping: any = { specie: 'Вид', genus: 'Род', family: 'Семейство', redBookRF: 'Красная книга РФ', redBookSO: 'Красная книга СО', place: 'Место сбора' };
    const th = Array.from(headers).find(h => h.textContent?.trim() === mapping[column]);
    if (!th) return { x: 0, y: 0 };
    const rect = th.getBoundingClientRect();
    const tableRect = th.closest('table')!.getBoundingClientRect();
    return { x: rect.left - tableRect.left, y: rect.bottom - tableRect.top };
  }

  // === CRUD ===
  startAdd() {
    this.isEditing = false;
    this.editingSeed = {} as Seed;
    this.editorForm.reset();
  }
  startEdit(s: Seed) {
    this.isEditing = true;
    this.editingSeed = s;
    this.editorForm.patchValue(s);
  }
  cancelEdit() {
    this.editingSeed = null;
    this.editorForm.reset();
  }
    onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedImageFile = file;
    }
  }
  onXrayImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedXrayFile = file;
    }
  }
  addSeed() {
    if (this.editorForm.invalid) return;

    const formData = new FormData();
    // Текстовые поля
    Object.entries(this.editorForm.value).forEach(([key, value]) => {
      formData.append(key, (value as any));
    });
    // Если выбрали первый файл
    if (this.selectedImageFile) {
      formData.append('image', this.selectedImageFile);
    }
    // Если выбрали второй файл
    if (this.selectedXrayFile) {
      formData.append('xrayimage', this.selectedXrayFile);
    }

    this.seedService.create(formData).subscribe(() => {
      this.cancelEdit();
      this.loadSeeds();
    });
  }

  updateSeed() {
    if (!this.editingSeed || this.editorForm.invalid) return;

    const formData = new FormData();
    Object.entries(this.editorForm.value).forEach(([key, value]) => {
      formData.append(key, (value as any));
    });
    if (this.selectedImageFile) {
      formData.append('image', this.selectedImageFile);
    }
    if (this.selectedXrayFile) {
      formData.append('xrayimage', this.selectedXrayFile);
    }

    this.seedService
      .update(+this.editingSeed!.seed_id, formData)
      .subscribe(() => {
        this.cancelEdit();
        this.loadSeeds();
      });
  }
  deleteSeed(s: Seed) {
    if (!confirm('Удалить эту запись?')) return;
    this.seedService.delete(s.seed_id).subscribe(() => this.loadSeeds());
  }
  saveSeed() {
    this.isEditing ? this.updateSeed() : this.addSeed();
  }
  exportAllToExcel(): void {
  // Если нет записей или пользователь не залогинен — не выполняем
  if (!this.auth.isLoggedIn() || !this.seeds?.length) {
    return;
  }

  // Подготавливаем массив объектов для экспорта
  // В каждой записи — нужные поля из Seed
  const dataForExcel = this.seeds.map(seed => ({
    ID: seed.seed_id,
    Название: seed.seed_name,
    Вид: seed.Specie.name_of_specie,
    Род: seed.Specie.Genus.name_of_genus,
    Семейство: seed.Specie.Genus.Family.name_of_family,
    'Дата сбора': seed.date_of_collection,
    'Выполненных': seed.completed_seeds,
    'Всхожесть (%)': seed.seed_germination,
    'Влажность (%)': seed.seed_moisture,
    'GPS высота': seed.gpsaltitude,
    'GPS долгота': seed.gpslongitude,
    'GPS широта': seed.gpslatitude,
    'Вес 1000 семян': seed.weight_of1000seeds,
    'Количество': seed.number_of_seeds,
    Описание: seed.comment,
    'Красная книга РФ': seed.RedBookRF?.category,
    'Красная книга СО': seed.RedBookSO?.category,
    'Место сбора': seed.PlaceOfCollection?.place_of_collection
  }));

  // Преобразуем JS-массив в лист (Worksheet)
  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataForExcel);

  // Указываем имя листа (например, «Коллекция семян»)
  const workbook: XLSX.WorkBook = {
    Sheets: { 'Коллекция семян': worksheet },
    SheetNames: ['Коллекция семян']
  };

  // Записываем книгу в бинарный буфер
  const excelBuffer: any = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array'
  });

  // Формируем Blob и «скачиваем» через FileSaver
  const blob = new Blob([excelBuffer], {
    type: 'application/octet-stream'
  });
  FileSaver.saveAs(blob, `Коллекция_семян.xlsx`);
}
}