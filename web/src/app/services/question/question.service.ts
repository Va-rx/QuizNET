import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Question } from '../../models/question.model';

const baseUrl = 'http://localhost:8080/api/questions';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  constructor(private http: HttpClient) { }

  getAll(): Observable<Question[]> {
    return this.http.get<Question[]>(baseUrl);
  }

  get(id: any): Observable<Question> {
    return this.http.get<Question>(`${baseUrl}/${id}`);
  }

  getAllWithAnswers(): Observable<Question[]> {
    return this.http.get<Question[]>(`${baseUrl}/answers`);
  }

  getQuestionWithAnswers(id: any): Observable<Question> {
    return this.http.get<Question>(`${baseUrl}/answers/${id}`);
  }

  create(data: any): Observable<any> {
    const formData = new FormData();
    formData.append('question', data.question);
    formData.append('answers', JSON.stringify(data.answers));
    if (data.image_link) {
      formData.append('image_link', data.image_link);
    }
    return this.http.post(baseUrl, formData);
  }

  update(id: any, data: any): Observable<any> {
    const formData = new FormData();
    formData.append('question', data.question);
    formData.append('answers', JSON.stringify(data.answers));
    if (data.image_link) {
      formData.append('image_link', data.image_link);
    }
    return this.http.put(`${baseUrl}/${id}`, formData);
  }

  delete(id: any): Observable<any> {
    return this.http.delete(`${baseUrl}/${id}`);
  }

  deleteAll(): Observable<any> {
    return this.http.delete(baseUrl);
  }

  // I would delete this
  findByQuestionDesciption(question: any): Observable<Question[]> {
    return this.http.get<Question[]>(`${baseUrl}?question=${question}`);
  }
}
