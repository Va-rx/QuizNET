import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

const baseUrl = 'http://72.145.1.108:8080/api/games';
@Injectable({
  providedIn: 'root'
})
export class GamesService {

  constructor(private http: HttpClient) { }

  getAllGames(): Observable<any> {
    return this.http.get(`${baseUrl}`);
  }

  getGameDetails(id: number): Observable<any> {
    return this.http.get(`${baseUrl}/${id}`);
  }
}
