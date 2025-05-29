import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Genus } from '../models/genus.model';

@Injectable({ providedIn: 'root' })
export class GenusService {
  private apiUrl = 'http://localhost:5000/api/genus';
  constructor(private http: HttpClient) {}
  getAll(): Observable<Genus[]> { return this.http.get<Genus[]>(this.apiUrl); }
  // … аналогично getById/create/update/delete
}