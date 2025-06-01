import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SeedService } from '../../services/seed.service';
import { Seed } from '../../models/seed.model';

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
