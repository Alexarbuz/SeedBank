import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlaceOfCollectionService } from '../../services/placeofcollection.service';
import { PlaceOfCollection } from '../../models/placeofcollection.model';

@Component({
  selector: 'app-place',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './place.component.html',
  styleUrls: ['./place.component.scss']
})
export class PlaceComponent implements OnInit {
  places: PlaceOfCollection[] = [];
  loading = false;
  error = '';
  editingPlace: PlaceOfCollection | null = null;
  form: FormGroup;

  constructor(
    private placeService: PlaceOfCollectionService,
    private fb: FormBuilder,
    private el: ElementRef
  ) {
    this.form = this.fb.group({
      place_of_collection: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadPlaces();
  }

  loadPlaces(): void {
    this.loading = true;
    this.placeService.getAll().subscribe({
      next: data => { this.places = data; this.loading = false; },
      error: () => { this.error = 'Ошибка загрузки'; this.loading = false; }
    });
  }

  startAdd(): void {
    this.editingPlace = {} as PlaceOfCollection;
    this.form.reset();
  }

  startEdit(p: PlaceOfCollection): void {
    this.editingPlace = p;
    this.form.patchValue({ place_of_collection: p.place_of_collection });
  }

  save(): void {
    if (this.form.invalid) return;
    const payload = { place_of_collection: this.form.value.place_of_collection };
    if (this.editingPlace?.id) {
      this.placeService.update(this.editingPlace.id.toString(), payload)
        .subscribe({ next: () => this.onSaveSuccess(), error: () => this.error = 'Ошибка обновления' });
    } else {
      this.placeService.create(payload)
        .subscribe({ next: () => this.onSaveSuccess(), error: () => this.error = 'Ошибка создания' });
    }
  }

  deletePlace(p: PlaceOfCollection): void {
    if (!confirm(`Удалить место "${p.place_of_collection}"?`)) return;
    this.placeService.delete(p.id.toString())
      .subscribe({ next: () => this.loadPlaces(), error: () => this.error = 'Ошибка удаления' });
  }

  closeModal(): void {
    this.editingPlace = null;
    this.form.reset();
  }

  onSaveSuccess(): void {
    this.closeModal();
    this.loadPlaces();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const backdrop = this.el.nativeElement.querySelector('.modal-backdrop');
    if (this.editingPlace && backdrop && backdrop.contains(event.target as Node)) {
      this.closeModal();
    }
  }
}
