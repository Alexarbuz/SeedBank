import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Account } from '../../models/account.model';
import { AccountService } from '../../services/account.service';
import { Role } from '../../models/role.model';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  accounts: Account[] = [];
  roles: Role[] = [];
  loading = false;
  error = '';
  editingAccount: Account | null = null;
  form: FormGroup;

  constructor(
    private accountService: AccountService,
    private fb: FormBuilder,
    private el: ElementRef,
    private http: HttpClient
  ) {
    this.form = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      patronymic: ['', Validators.required],
      login: ['', Validators.required],
      password: ['', Validators.required],
      role_id: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAccounts();
    this.loadRoles();
  }

  loadAccounts(): void {
    this.loading = true;
    this.accountService.getAll().subscribe({
      next: data => { this.accounts = data; this.loading = false; },
      error: () => { this.error = 'Ошибка загрузки пользователей'; this.loading = false; }
    });
  }

  loadRoles(): void {
    this.http.get<Role[]>('http://localhost:5000/api/roles').subscribe({
      next: data => { this.roles = data; },
      error: () => { this.error = 'Ошибка загрузки ролей'; }
    });
  }

  startAdd(): void {
    this.editingAccount = {} as Account;
    this.form.reset();
  }

  startEdit(a: Account): void {
    this.editingAccount = a;
    this.form.patchValue({
      first_name: a.first_name,
      last_name: a.last_name,
      patronymic: a.patronymic,
      login: a.login,
      password: a.password,
      role_id: a.Role.id
    });
  }

  save(): void {
    if (this.form.invalid) return;

    const { first_name, last_name, patronymic, login, password, role_id } = this.form.value;
    const payload = { first_name, last_name, patronymic, login, password, role_id };
    const selectedRole = this.roles.find(r => r.id === +role_id);
    if (!selectedRole) {
      this.error = 'Роль не найдена';
      return;
    }

    if (this.editingAccount && this.editingAccount.id) {
      this.accountService.update(this.editingAccount.id.toString(), payload)
        .subscribe({
          next: () => this.onSaveSuccess(),
          error: () => this.error = 'Ошибка обновления пользователя'
        });
    } else {
      this.accountService.create(payload)
        .subscribe({
          next: () => this.onSaveSuccess(),
          error: () => this.error = 'Ошибка создания пользователя'
        });
    }
  }

  onSaveSuccess(): void {
    this.closeModal();
    this.loadAccounts();
  }

  deleteAccount(a: Account): void {
    if (!confirm(`Удалить пользователя "${a.first_name} ${a.last_name}"?`)) return;
    this.accountService.delete(a.id.toString())
      .subscribe({
        next: () => this.loadAccounts(),
        error: () => this.error = 'Ошибка удаления пользователя'
      });
  }

  closeModal(): void {
    this.editingAccount = null;
    this.form.reset();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const backdrop = this.el.nativeElement.querySelector('.modal-backdrop');
    if (this.editingAccount && backdrop && backdrop.contains(event.target as Node)) {
      this.closeModal();
    }
  }
}
