import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import { Test } from '../../models/test.model';

const baseUrl = 'http://localhost:8080/api/tests';
@Injectable({
  providedIn: 'root'
})
export class TestService {

  constructor(private http: HttpClient) { }
  get(id: number): Observable<any> {
    return this.http.get(`${baseUrl}/${id}`);
  }

  getAll(): Observable<any> {
    return this.http.get<Test[]>(baseUrl);
  }

  create(data: any): Observable<any> {
    return this.http.post<Test>(baseUrl, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/${id}`);
  }

}
