import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SeedService } from '../../services/seed.service';
import { Seed } from '../../models/seed.model';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-seed-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './seedcard.component.html',
  styleUrls: ['./seedcard.component.scss']
})
export class SeedCardComponent implements OnInit {
  seed?: Seed;
  loading = true;
  error = '';
  enlargedImage: string | null = null; // URL увеличенного изображения

  constructor(
    private route: ActivatedRoute,
    private seedService: SeedService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.seedService.getById(id).subscribe({
        next: data => {
          this.seed = data;
          this.loading = false;
        },
        error: () => {
          this.error = 'Не удалось загрузить данные семени.';
          this.loading = false;
        }
      });
    } else {
      this.error = 'Некорректный идентификатор семени.';
      this.loading = false;
    }
  }
exportToExcel(): void {
  if (!this.seed) return;

  const seed = this.seed;

  // Подготовка данных в виде массива объектов
  const data = [
    {
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
      'Описание': seed.comment,
      'Красная книга РФ': seed.RedBookRF.category,
      'Красная книга СО': seed.RedBookSO.category,
      'Место сбора': seed.PlaceOfCollection.place_of_collection
    }
  ];

  // Создание рабочего листа
  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

  // Создание книги Excel
  const workbook: XLSX.WorkBook = {
    Sheets: { 'Карточка семени': worksheet },
    SheetNames: ['Карточка семени']
  };

  // Преобразуем в бинарный формат и сохраняем
  const excelBuffer: any = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array'
  });

  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  FileSaver.saveAs(blob, `Карточка_семени_${seed.seed_name}.xlsx`);
}
  onImgError(event: Event) {
    const imgEl = event.target as HTMLImageElement;
    imgEl.src = 'http://localhost:5000/static/uploads/seed.png';
  }

  // Открыть оверлей с увеличенным изображением
  openOverlay(url: string) {
    this.enlargedImage = url;
  }

  // Закрыть оверлей
  closeOverlay() {
    this.enlargedImage = null;
  }
}
