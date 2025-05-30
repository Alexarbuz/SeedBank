import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GenusService } from '../../services/genus.service';
import { FamilyService } from '../../services/family.service';
import { Genus } from '../../models/genus.model';
import { Family } from '../../models/family.model';

@Component({
  selector: 'app-genus',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './genus.component.html',
  styleUrls: ['./genus.component.scss']
})
export class GenusComponent implements OnInit {
  genera: Genus[] = [];
  families: Family[] = [];
  loading = false;
  error = '';
  editingGenus: Genus | null = null;
  form: FormGroup;

  constructor(
    private genusService: GenusService,
    private familyService: FamilyService,
    private fb: FormBuilder,
    private el: ElementRef
  ) {
    this.form = this.fb.group({
      name_of_genus: ['', Validators.required],
      family_id: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadFamilies();
    this.loadGenera();
  }

  loadFamilies(): void {
    this.familyService.getAll().subscribe({ next: data => this.families = data });
  }

  loadGenera(): void {
    this.loading = true;
    this.genusService.getAll().subscribe({
      next: data => { this.genera = data; this.loading = false; },
      error: () => { this.error = 'Ошибка загрузки'; this.loading = false; }
    });
  }

  startAdd(): void {
    this.editingGenus = {} as Genus;
    this.form.reset();
  }

  startEdit(g: Genus): void {
    this.editingGenus = g;
    this.form.patchValue({
      name_of_genus: g.name_of_genus,
      family_id: g.Family.id
    });
  }

  save(): void {
    if (this.form.invalid) return;
    const { name_of_genus, family_id } = this.form.value;
    const payload = { name_of_genus, family_id };
    if (this.editingGenus && this.editingGenus.id) {
      this.genusService.update(this.editingGenus.id.toString(), payload)
        .subscribe({ next: () => this.onSaveSuccess(), error: () => this.error = 'Ошибка обновления' });
    } else {
      this.genusService.create(payload)
        .subscribe({ next: () => this.onSaveSuccess(), error: () => this.error = 'Ошибка создания' });
    }
  }

  onSaveSuccess(): void {
    this.closeModal();
    this.loadGenera();
  }

  deleteGenus(g: Genus): void {
    if (!confirm(`Удалить род "${g.name_of_genus}"?`)) return;
    this.genusService.delete(g.id.toString())
      .subscribe({ next: () => this.loadGenera(), error: () => this.error = 'Ошибка удаления' });
  }

  closeModal(): void {
    this.editingGenus = null;
    this.form.reset();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const backdrop = this.el.nativeElement.querySelector('.modal-backdrop');
    if (this.editingGenus && backdrop && backdrop.contains(event.target as Node)) {
      this.closeModal();
    }
  }
}
