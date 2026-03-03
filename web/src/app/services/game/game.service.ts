import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

const baseUrl = '/api/games';
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
