import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Specie } from '../models/specie.model';

@Injectable({ providedIn: 'root' })
export class SpecieService {
  private apiUrl = 'http://localhost:5000/api/species';
  constructor(private http: HttpClient) {}
  getAll(): Observable<Specie[]> { return this.http.get<Specie[]>(this.apiUrl); }
  getById(id: string) { return this.http.get<Specie>(`${this.apiUrl}/${id}`); }
    create(data: Partial<Specie>) { return this.http.post<Specie>(this.apiUrl, data); }
    update(id: string, data: Partial<Specie>) { return this.http.put<Specie>(`${this.apiUrl}/${id}`, data); }
    delete(id: string) { return this.http.delete<{message:string}>(`${this.apiUrl}/${id}`); }
}