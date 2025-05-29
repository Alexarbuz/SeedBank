import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Seed } from '../models/seed.model';

@Injectable({ providedIn: 'root' })
export class SeedService {
  private apiUrl = 'http://localhost:5000/api/seeds';
  constructor(private http: HttpClient) {}
  getAll(): Observable<Seed[]> { return this.http.get<Seed[]>(this.apiUrl); }
  getById(id: string) { return this.http.get<Seed>(`${this.apiUrl}/${id}`); }
  create(data: Partial<Seed>) { return this.http.post<Seed>(this.apiUrl, data); }
  update(id: string, data: Partial<Seed>) { return this.http.put<Seed>(`${this.apiUrl}/${id}`, data); }
  delete(id: string) { return this.http.delete<{message:string}>(`${this.apiUrl}/${id}`); }
}