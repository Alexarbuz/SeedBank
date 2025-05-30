import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RedBook } from '../models/redbook.model';

@Injectable({ providedIn: 'root' })
export class RedbookService {
  private apiUrl = 'http://localhost:5000/api/Red-books';
  constructor(private http: HttpClient) {}
  getAll(): Observable<RedBook[]> { return this.http.get<RedBook[]>(this.apiUrl); }
  getById(id: string) { return this.http.get<RedBook>(`${this.apiUrl}/${id}`); }
        create(data: Partial<RedBook>) { return this.http.post<RedBook>(this.apiUrl, data); }
        update(id: string, data: Partial<RedBook>) { return this.http.put<RedBook>(`${this.apiUrl}/${id}`, data); }
        delete(id: string) { return this.http.delete<{message:string}>(`${this.apiUrl}/${id}`); }
  // … аналогично getById/create/update/delete
}