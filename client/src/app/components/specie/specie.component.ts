import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SpecieService } from '../../services/specie.service';
import { GenusService } from '../../services/genus.service';
import { Specie } from '../../models/specie.model';
import { Genus } from '../../models/genus.model';

@Component({
  selector: 'app-specie',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './specie.component.html',
  styleUrls: ['./specie.component.scss']
})
export class SpecieComponent implements OnInit {
  species: Specie[] = [];
  genera: Genus[] = [];
  loading = false;
  error = '';
  editingSpecie: Specie | null = null;
  form: FormGroup;

  constructor(
    private specieService: SpecieService,
    private genusService: GenusService,
    private fb: FormBuilder,
    private el: ElementRef
  ) {
    this.form = this.fb.group({
      name_of_specie: ['', Validators.required],
      genus_id: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadGenera();
    this.loadSpecies();
  }

  loadGenera(): void {
    this.genusService.getAll().subscribe({ next: data => this.genera = data });
  }

  loadSpecies(): void {
    this.loading = true;
    this.specieService.getAll().subscribe({
      next: data => { this.species = data; this.loading = false; },
      error: () => { this.error = 'Ошибка загрузки'; this.loading = false; }
    });
  }

  startAdd(): void {
    this.editingSpecie = {} as Specie;
    this.form.reset();
  }

  startEdit(s: Specie): void {
    this.editingSpecie = s;
    this.form.patchValue({
      name_of_specie: s.name_of_specie,
      genus_id: s.Genus.id
    });
  }

  save(): void {
    if (this.form.invalid) return;
    const { name_of_specie, genus_id } = this.form.value;
    const payload = { name_of_specie, genus_id };
    if (this.editingSpecie && this.editingSpecie.id) {
      this.specieService.update(this.editingSpecie.id.toString(), payload)
        .subscribe({ next: () => this.onSaveSuccess(), error: () => this.error = 'Ошибка обновления' });
    } else {
      this.specieService.create(payload)
        .subscribe({ next: () => this.onSaveSuccess(), error: () => this.error = 'Ошибка создания' });
    }
  }

  onSaveSuccess(): void {
    this.closeModal();
    this.loadSpecies();
  }

  deleteSpecie(s: Specie): void {
    if (!confirm(`Удалить вид "${s.name_of_specie}"?`)) return;
    this.specieService.delete(s.id.toString())
      .subscribe({ next: () => this.loadSpecies(), error: () => this.error = 'Ошибка удаления' });
  }

  closeModal(): void {
    this.editingSpecie = null;
    this.form.reset();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const backdrop = this.el.nativeElement.querySelector('.modal-backdrop');
    if (this.editingSpecie && backdrop && backdrop.contains(event.target as Node)) {
      this.closeModal();
    }
  }
}
