import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PlaceOfCollection } from '../models/placeofcollection.model';

@Injectable({ providedIn: 'root' })
export class PlaceOfCollectionService {
  private apiUrl = 'http://localhost:5000/api/places';
  constructor(private http: HttpClient) {}
  getAll(): Observable<PlaceOfCollection[]> { return this.http.get<PlaceOfCollection[]>(this.apiUrl); }
  // … аналогично getById/create/update/delete
}