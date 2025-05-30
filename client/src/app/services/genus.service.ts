import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Genus } from '../models/genus.model';

@Injectable({ providedIn: 'root' })
export class GenusService {
  private apiUrl = 'http://localhost:5000/api/genus';
  constructor(private http: HttpClient) {}
  getAll(): Observable<Genus[]> { return this.http.get<Genus[]>(this.apiUrl); }
    getById(id: string) { return this.http.get<Genus>(`${this.apiUrl}/${id}`); }
    create(data: Partial<Genus>) { return this.http.post<Genus>(this.apiUrl, data); }
    update(id: string, data: Partial<Genus>) { return this.http.put<Genus>(`${this.apiUrl}/${id}`, data); }
    delete(id: string) { return this.http.delete<{message:string}>(`${this.apiUrl}/${id}`); }
  // … аналогично getById/create/update/delete
}