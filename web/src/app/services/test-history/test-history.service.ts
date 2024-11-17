import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {AuthService} from "../auth/auth.service";
import {TestHistory} from "../../models/test-history.model";
const baseUrl = 'http://72.145.1.108:8080/api/test-history';
@Injectable({
  providedIn: 'root'
})
export class TestHistoryService {

  constructor(private http: HttpClient, private authService: AuthService) { }

  userId = this.authService.getUserId()

  get(id: number): Observable<TestHistory> {
    return this.http.get<TestHistory>(`${baseUrl}/${id}`);
  }

  getAll(): Observable<TestHistory[]> {
    return this.http.get<TestHistory[]>(baseUrl);
  }

  getTestsConnectedToUser(): Observable<TestHistory[]> {
    return this.http.get<TestHistory[]>(`${baseUrl}/user/${this.userId}`);
  }
}
