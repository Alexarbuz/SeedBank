import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Family } from '../models/family.model';

@Injectable({ providedIn: 'root' })
export class FamilyService {
  private apiUrl = 'http://localhost:5000/api/families';
  constructor(private http: HttpClient) {}
  getAll(): Observable<Family[]> { return this.http.get<Family[]>(this.apiUrl); }
  // … аналогично getById/create/update/delete
}