import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import { Level } from 'src/app/models/level.model';

const baseUrl = 'http://localhost:8080/api/levels';
@Injectable({
  providedIn: 'root'
})
export class LevelService {

  constructor(private http: HttpClient) { }

  getLevel(id: number): Observable<Level> {
    return this.http.get<Level>(`${baseUrl}/${id}`);
  }

  deleteLevel(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${baseUrl}/${id}`);
  }

  createLevel(level: Level): Observable<Level>{
    const formData: FormData = new FormData();
    formData.append('gameId', level.gameId.toString());
    formData.append('name', level.name);
    formData.append('difficulty', level.difficulty);
    formData.append('time', level.time.toString());
    formData.append('map', level.map);
    return this.http.post<Level>(`${baseUrl}/games/${level.gameId}`, formData);
  }

  getAllLevels(): Observable<{[key: string]: Level[]}> {
    return this.http.get<{[key: string]: Level[]}>(baseUrl);
  }
}
