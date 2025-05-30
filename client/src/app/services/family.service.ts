import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Family } from '../models/family.model';

@Injectable({ providedIn: 'root' })
export class FamilyService {
  private apiUrl = 'http://localhost:5000/api/families';
  constructor(private http: HttpClient) {}
  getAll(): Observable<Family[]> { return this.http.get<Family[]>(this.apiUrl); }
  getById(id: string) { return this.http.get<Family>(`${this.apiUrl}/${id}`); }
  create(data: Partial<Family>) { return this.http.post<Family>(this.apiUrl, data); }
  update(id: string, data: Partial<Family>) { return this.http.put<Family>(`${this.apiUrl}/${id}`, data); }
  delete(id: string) { return this.http.delete<{message:string}>(`${this.apiUrl}/${id}`); }
}