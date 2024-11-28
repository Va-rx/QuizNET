import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

const baseUrl = 'http://localhost:8080/api/maps';
@Injectable({
  providedIn: 'root'
})
export class MapService {

  constructor(private http: HttpClient) { }

  getMap(id: number): Observable<any> {
    return this.http.get(`${baseUrl}/${id}`);
  }

  deleteMap(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/${id}`);
  }

  createMap(gameId: number, map: any) {
    return this.http.post(`${baseUrl}/${gameId}`, map);
  }
}
