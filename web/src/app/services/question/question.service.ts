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


  getAllQuestions(): Observable<Question[]> {
    return this.http.get<Question[]>(baseUrl);
  }

  getQuestion(id: number): Observable<Question> {
    return this.http.get<Question>(`${baseUrl}/${id}`);
  }

  createQuestion(question: Question): Observable<any> {
    return this.http.post<Question>(baseUrl, question);
  }

  deleteQuestion(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/${id}`);
  }

  updateQuestion(id: number, question: Question): Observable<any> {
    const formData = new FormData();
    formData.append('question', question.question);
    formData.append('type', question.type);

    if (question.position){
      formData.append('position', question.position.toString());
    }

    if (question.image_link) {
      formData.append('image_link', question.image_link);
    }
    return this.http.patch(`${baseUrl}/${id}`, formData);
  }
}
