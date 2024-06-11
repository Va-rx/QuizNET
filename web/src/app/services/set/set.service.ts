import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Set } from 'src/app/models/set.model';

const baseUrl = 'http://localhost:8080/api/sets';

@Injectable({
  providedIn: 'root'
})
export class SetService {

  constructor(private http: HttpClient) { }

  getAll(): Observable<Set[]> {
    return this.http.get<Set[]>(baseUrl);
  }

  getSetById(id: number): Observable<Set[]> {
        return this.http.get<Set[]>(`${baseUrl}/${id}`);
  }

  get(id: number): Observable<Set> {
    return this.http.get<Set>(`${baseUrl}/${id}`);
  }

  create(data: Set): Observable<any> {
    const formData = new FormData();

    formData.append('test_id', data.test_id);
    formData.append('question_id', data.question_id);

    return this.http.post(baseUrl, formData);
  }

  update(id: number, data: Set): Observable<any> {
    return this.http.put(`${baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/${id}`);
  }
}
