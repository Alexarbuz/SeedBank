import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FamilyService } from '../../services/family.service';
import { Family } from '../../models/family.model';

@Component({
  selector: 'app-family',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './family.component.html',
  styleUrls: ['./family.component.scss']
})
export class FamilyComponent implements OnInit {
  families: Family[] = [];
  loading = false;
  error = '';
  editingFamily: Family | null = null;
  form: FormGroup;

  constructor(
    private familyService: FamilyService,
    private fb: FormBuilder,
    private el: ElementRef
  ) {
    this.form = this.fb.group({
      name_of_family: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadFamilies();
  }

  loadFamilies(): void {
    this.loading = true;
    this.familyService.getAll().subscribe({
      next: data => { this.families = data; this.loading = false; },
      error: () => { this.error = 'Ошибка загрузки'; this.loading = false; }
    });
  }

  startAdd(): void {
    this.editingFamily = {} as Family;
    this.form.reset();
  }

  startEdit(f: Family): void {
    this.editingFamily = f;
    this.form.patchValue({ name_of_family: f.name_of_family });
  }

  save(): void {
    if (this.form.invalid) return;
    const value = this.form.value;
    if (this.editingFamily && this.editingFamily.id) {
      this.familyService.update(this.editingFamily.id.toString(), value)
        .subscribe({ next: () => this.onSaveSuccess(), error: () => this.error = 'Ошибка обновления' });
    } else {
      this.familyService.create(value)
        .subscribe({ next: () => this.onSaveSuccess(), error: () => this.error = 'Ошибка создания' });
    }
  }

  onSaveSuccess(): void {
    this.closeModal();
    this.loadFamilies();
  }

  deleteFamily(f: Family): void {
    if (!confirm(`Удалить семейство "${f.name_of_family}"?`)) return;
    this.familyService.delete(f.id.toString())
      .subscribe({ next: () => this.loadFamilies(), error: () => this.error = 'Ошибка удаления' });
  }

  closeModal(): void {
    this.editingFamily = null;
    this.form.reset();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const modal = this.el.nativeElement.querySelector('.modal');
    const backdrop = this.el.nativeElement.querySelector('.modal-backdrop');
    if (this.editingFamily && backdrop && backdrop.contains(event.target as Node)) {
      this.closeModal();
    }
  }
}