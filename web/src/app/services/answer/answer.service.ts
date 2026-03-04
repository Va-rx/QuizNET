import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Answer } from 'src/app/models/question.model';

const baseUrl = '/api/answers';
@Injectable({
  providedIn: 'root'
})
export class AnswerService {

  constructor(private http: HttpClient) { }


  getAllAnswers(): Observable<any> {
    return this.http.get(baseUrl);
  }

  getAnswer(id: number): Observable<any> {
    return this.http.get(`${baseUrl}/${id}`);
  }

  updateAnswer(id: number, answer: Answer): Observable<any> {
    return this.http.put(`${baseUrl}/${id}`, answer);
  }

  createAnswer(answer: Answer): Observable<any> {
    return this.http.post(`${baseUrl}`, answer);
  }

  deleteAnswer(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/${id}`);
  }

}
