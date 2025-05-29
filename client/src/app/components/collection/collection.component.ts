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

@Component({
  selector: 'app-collection',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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

  // фильтры и сортировка
  filters: { [key: string]: string } = {};
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' | null = null;
  filterToggles: { [key: string]: boolean } = {};

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
      seed_id: [''],
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
      image: ['', Validators.required],
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

  applyFilter(column: string, value: string, event: MouseEvent) {
    event.stopPropagation();
    if (value) this.filters[column] = value;
    else delete this.filters[column];
    this.filterToggles[column] = false;
  }

  setSort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc'
        : this.sortDirection === 'desc' ? null : 'asc';
      if (!this.sortDirection) this.sortColumn = null;
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
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
    Object.entries(this.filters).forEach(([k, v]) => {
      res = res.filter(s => {
        switch (k) {
          case 'specie':    return s.Specie.name_of_specie === v;
          case 'genus':     return s.Specie.Genus.name_of_genus === v;
          case 'family':    return s.Specie.Genus.Family.name_of_family === v;
          case 'place':     return s.PlaceOfCollection.place_of_collection === v;
          case 'redBookRF': return s.RedBookRF.category === v;
          case 'redBookSO': return s.RedBookSO.category === v;
          default:          return true;
        }
      });
    });
    if (this.sortColumn && this.sortDirection) {
      res.sort((a, b) => {
        const av = this.getSortValue(a, this.sortColumn!);
        const bv = this.getSortValue(b, this.sortColumn!);
        if (av < bv) return this.sortDirection === 'asc' ? -1 : 1;
        if (av > bv) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
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
  addSeed() {
    if (this.editorForm.invalid) return;
    this.seedService.create(this.editorForm.value).subscribe(() => {
      this.cancelEdit();
      this.loadSeeds();
    });
  }
  updateSeed() {
    if (!this.editingSeed || this.editorForm.invalid) return;
    this.seedService.update(this.editingSeed.seed_id, this.editorForm.value).subscribe(() => {
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
}