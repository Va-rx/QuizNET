import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

const baseUrl = 'http://localhost:8080/api/levels';
@Injectable({
  providedIn: 'root'
})
export class LevelService {

  constructor(private http: HttpClient) { }

  getLevel(id: number): Observable<any> {
    return this.http.get(`${baseUrl}/${id}`);
  }

  deleteLevel(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/${id}`);
  }

  createLevel(gameId: number, level: any) {
    return this.http.post(`${baseUrl}/${gameId}`, level);
  }
}
