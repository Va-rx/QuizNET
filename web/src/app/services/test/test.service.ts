import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Test } from '../../models/test.model';

const baseUrl = 'http://localhost:8080/api/tests';
@Injectable({
  providedIn: 'root'
})
export class TestService {

  constructor(private http: HttpClient) { }

  getAll(): Observable<any> {
    return this.http.get<Test[]>(baseUrl);
  }

  get(id: number): Observable<any> {
    return this.http.get(`${baseUrl}/${id}`);
  }

  getWithDetails(id: number): Observable<any> {
    return this.http.get(`${baseUrl}/${id}/details`);
  }

  create(data: any): Observable<any> {
    return this.http.post<Test>(baseUrl, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/${id}`);
  }

  update(data: any): Observable<any> {
    return this.http.put(`${baseUrl}/${data.id}`, data);
  }

  addQuestion(data: any, id: number): Observable<any> {
    return this.http.post(`${baseUrl}/${id}/questions`, data);
  }
}
