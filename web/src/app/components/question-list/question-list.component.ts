import { Component, OnInit } from '@angular/core';
import { Question } from 'src/app/models/question.model';
import { QuestionService } from 'src/app/services/question.service';
import {FormControl} from "@angular/forms";
import {combineLatest, map, Observable, startWith} from "rxjs";
@Component({
  selector: 'app-questions-list',
  templateUrl: './question-list.component.html',
  styleUrls: ['./question-list.component.css']
})
export class QuestionsListComponent implements OnInit {

  filteredQuestions$: Observable<Question[]> | undefined;
  questions$: Observable<Question[]> | undefined;
  currentIndex = -1;
  title = new FormControl('');
  currentQuestion!: Question;
  constructor(private questionService: QuestionService) { }

  ngOnInit(): void {
    this.questions$ = this.questionService.getAll();

    const searchedQuestion$ = this.title.valueChanges.pipe(
      startWith(this.title.value)
    );
    this.filteredQuestions$ = combineLatest([this.questions$, searchedQuestion$]).pipe(
      map(([questions, searchedQuestion]) =>
        questions.filter(
          (question) =>
            searchedQuestion === '' ||
            question.question.toLowerCase().includes(searchedQuestion ? searchedQuestion.toLowerCase() : '')

        )
      )
    );
  }

  setActiveQuestion(question: Question, index: number): void {
    this.currentQuestion = question;
    this.currentIndex = index;
  }

  removeAllQuestions(): void {
     this.questions$ = this.questionService.deleteAll();
     this.filteredQuestions$ = this.questions$;
  }

  imageSrc(questionSrc: String): string {
    return `data:image/png;base64,${questionSrc}`;
  }
}
