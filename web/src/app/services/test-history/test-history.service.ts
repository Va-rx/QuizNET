import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Test} from "../../models/test.model";
const baseUrl = 'http://localhost:8080/api/test-history';
@Injectable({
  providedIn: 'root'
})
export class TestHistoryService {

  constructor(private http: HttpClient) { }

  get(id: number): Observable<Test> {
    return this.http.get<Test>(`${baseUrl}/${id}`);
  }
}
