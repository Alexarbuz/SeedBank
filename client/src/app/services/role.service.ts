import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../models/role.model';

@Injectable({ providedIn: 'root' })
export class RedbookService {
  private apiUrl = 'http://localhost:5000/api/Red-books';
  constructor(private http: HttpClient) {}
  getAll(): Observable<Role[]> { return this.http.get<Role[]>(this.apiUrl); }
  getById(id: string) { return this.http.get<Role>(`${this.apiUrl}/${id}`); }
}