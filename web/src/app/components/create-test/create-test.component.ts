import { Component, OnInit } from '@angular/core';
import { Observable, of, map } from 'rxjs';
import { Test } from 'src/app/models/test.model';
import { TestService } from 'src/app/services/test/test.service';
import { SetService } from 'src/app/services/set/set.service';
import { QuestionService } from 'src/app/services/question/question.service';
import { Question } from 'src/app/models/question.model';


@Component({
  selector: 'app-create-test',
  templateUrl: './create-test.component.html',
  styleUrls: ['./create-test.component.css']
})
export class CreateTestComponent implements OnInit{
  tests$: Observable<Test[]> = of();
  test: Test = new Test();
  currentTest?: Test;
  currentIndex?: number;
  showForm = false;
  questions: Question[] = [];

  constructor(private testsService: TestService, private setService: SetService, private questionService: QuestionService) { }

  ngOnInit() {
    this.tests$ = this.testsService.getAll();
  }

  setActiveTest(test: Test, index: number): void {
    this.questions = [];
    this.currentTest = test;
    this.currentIndex = index;

    this.setService.getSetById(test.test_id).subscribe(
      sets => {
        sets.forEach(set => {
          this.questionService.get(set.question_id).subscribe(
            question => {
              console.log(question);
              this.questions.push(question);
            },
            error => {
              console.log(error);
            });
        });
      },
      error => {
        console.log(error);
      });
  }

  onSubmit(data: Test): void {
    this.testsService.create(data).subscribe(
      response => {
        console.log(response);
        this.showForm = false;
        this.test = new Test();

        this.tests$ = this.testsService.getAll();
      },
      error => {
        console.log(error);
      });
  }

  deleteTest(id: number, event: Event): void {
    event.stopPropagation();
    console.log("ID:" + id);
  
    this.testsService.delete(id).subscribe(
      response => {
        console.log(response);
        setTimeout(() => {
          this.tests$ = this.testsService.getAll();
        }, 1000);
      },
      error => {
        console.log(error);
      });
  }
}
