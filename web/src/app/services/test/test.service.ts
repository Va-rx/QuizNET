import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Test } from '../../models/test.model';
import { Question } from 'src/app/models/question.model';

const baseUrl = 'http://72.145.1.108:8080/api/tests';
@Injectable({
  providedIn: 'root'
})
export class TestService {

  constructor(private http: HttpClient) { }

  getAllTests(): Observable<any> {
    return this.http.get<Test[]>(baseUrl);
  }

  getTest(id: number): Observable<any> {
    return this.http.get(`${baseUrl}/${id}`);
  }

  getTestDetails(id: number): Observable<any> {
    return this.http.get(`${baseUrl}/${id}/details`);
  }

  createTest(test: Test): Observable<any> {
    return this.http.post<Test>(baseUrl, test);
  }

  deleteTest(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/${id}`);
  }

  updateTest(id: number, test: any): Observable<any> {
    return this.http.put(`${baseUrl}/${id}`, test);
  }

  addQuestion(id: number, question: Question): Observable<any> {
    return this.http.post(`${baseUrl}/${id}/questions`, question);
  }
}
