import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account } from '../models/account.model';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private apiUrl = 'http://localhost:5000/api/accounts';
  constructor(private http: HttpClient) {}
  getAll(): Observable<Account[]> { return this.http.get<Account[]>(this.apiUrl); }
    getById(id: string) { return this.http.get<Account>(`${this.apiUrl}/${id}`); }
    create(data: Partial<Account>) { return this.http.post<Account>(this.apiUrl, data); }
    update(id: string, data: Partial<Account>) { return this.http.put<Account>(`${this.apiUrl}/${id}`, data); }
    delete(id: string) { return this.http.delete<{message:string}>(`${this.apiUrl}/${id}`); }
}