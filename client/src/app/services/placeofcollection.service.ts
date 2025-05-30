import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PlaceOfCollection } from '../models/placeofcollection.model';

@Injectable({ providedIn: 'root' })
export class PlaceOfCollectionService {
  private apiUrl = 'http://localhost:5000/api/places';
  constructor(private http: HttpClient) {}
  getAll(): Observable<PlaceOfCollection[]> { return this.http.get<PlaceOfCollection[]>(this.apiUrl); }
  getById(id: string) { return this.http.get<PlaceOfCollection>(`${this.apiUrl}/${id}`); }
      create(data: Partial<PlaceOfCollection>) { return this.http.post<PlaceOfCollection>(this.apiUrl, data); }
      update(id: string, data: Partial<PlaceOfCollection>) { return this.http.put<PlaceOfCollection>(`${this.apiUrl}/${id}`, data); }
      delete(id: string) { return this.http.delete<{message:string}>(`${this.apiUrl}/${id}`); }
  // … аналогично getById/create/update/delete
}