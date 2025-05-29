import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RedBook } from '../models/redbook.model';

@Injectable({ providedIn: 'root' })
export class RedbookService {
  private apiUrl = 'http://localhost:5000/api/Red-books';
  constructor(private http: HttpClient) {}
  getAll(): Observable<RedBook[]> { return this.http.get<RedBook[]>(this.apiUrl); }
  // … аналогично getById/create/update/delete
}