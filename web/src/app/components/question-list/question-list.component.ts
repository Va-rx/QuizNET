import { Component, OnInit } from '@angular/core';
import { Question } from 'src/app/models/question.model';
import { QuestionService } from 'src/app/services/question.service';

@Component({
  selector: 'app-questions-list',
  templateUrl: './question-list.component.html',
  styleUrls: ['./question-list.component.css']
})
export class QuestionsListComponent implements OnInit {

  questions?: Question[];
  currentQuestion: Question = {};
  currentIndex = -1;
  title = '';

  constructor(private questionService: QuestionService) { }

  ngOnInit(): void {
    this.retrieveQuestions();
  }

  retrieveQuestions(): void {
    this.questionService.getAll()
      .subscribe({
        next: (data) => {
          this.questions = data;
          console.log(data);
        },
        error: (e) => console.error(e)
      });
  }

  refreshList(): void {
    this.retrieveQuestions();
    this.currentQuestion = {};
    this.currentIndex = -1;
  }

  setActiveQuestion(question: Question, index: number): void {
    this.currentQuestion = question;
    this.currentIndex = index;
  }

  removeAllQuestions(): void {
    this.questionService.deleteAll()
      .subscribe({
        next: (res) => {
          console.log(res);
          this.refreshList();
        },
        error: (e) => console.error(e)
      });
  }

  searchTitle(): void {
    this.currentQuestion = {};
    this.currentIndex = -1;
    console.log(this.title);
    this.questionService.findByQuestionDesciption(this.title)
      .subscribe({
        next: (data) => {
          this.questions = data;
          console.log(data);
        },
        error: (e) => console.error(e)
      });
  }

}
