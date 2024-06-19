import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Set } from 'src/app/models/set.model';
import {Question} from "../../models/question.model";

const baseUrl = 'http://localhost:8080/api/sets';

@Injectable({
  providedIn: 'root'
})
export class SetService {

  constructor(private http: HttpClient) { }

  getAll(): Observable<Set[]> {
    return this.http.get<Set[]>(baseUrl);
  }

  getQuestionsByTestId(id: number): Observable<Question[]> {
        return this.http.get<Question[]>(`${baseUrl}/${id}`);
  }

  create(data: Set): Observable<any> {
    return this.http.post(baseUrl, data);
  }

  createAll(sets: Set[]): Observable<any> {
    return this.http.post(`${baseUrl}/all`, sets);
  }

  update(id: number, data: Set): Observable<any> {
    return this.http.put(`${baseUrl}/${id}`, data);
  }

  deleteSet(set: Set): Observable<any> {
    return this.http.delete(`${baseUrl}/${set.testId}/${set.questionId}`);
  }

  deleteAll(sets: Set[]): Observable<any> {
    return this.http.post(`${baseUrl}/deleteAll`, sets);
  }

}
