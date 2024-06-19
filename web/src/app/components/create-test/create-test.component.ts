import { Component, OnInit } from '@angular/core';
import {Observable, of} from 'rxjs';
import { Test } from 'src/app/models/test.model';
import { TestService } from 'src/app/services/test/test.service';
import { SetService } from 'src/app/services/set/set.service';
import { Question } from 'src/app/models/question.model';
import {QuestionService} from "../../services/question/question.service";
import {QuestionDetailsComponent} from "../question-details/question-details.component";
import {MatDialog} from "@angular/material/dialog";


@Component({
  selector: 'app-create-test',
  templateUrl: './create-test.component.html',
  styleUrls: ['./create-test.component.css']
})
export class CreateTestComponent implements OnInit{
  tests$: Observable<Test[]> = of();
  test: Test = new Test();
  currentTest!: Test;
  currentIndex?: number;
  showForm = false;
  testQuestions: Question[] = [];
  allQuestions: Question[] = [];
  uniqueQuestions: Question[] = [];
  questionIdsToDelete: number[] = [];
  questionIdsToAdd: number[] = [];

  constructor(private testsService: TestService, private setService: SetService, private questionService: QuestionService, private dialog: MatDialog) { }

  ngOnInit() {
    this.tests$ = this.testsService.getAll();
    this.questionService.getAllWithAnswers().subscribe(question => this.allQuestions = question);

  }

  setActiveTest(test: Test, index: number): void {
    this.currentTest = test;
    this.currentIndex = index;
    this.setService.getQuestionsByTestId(this.currentTest.id).subscribe(
      question => {
        this.testQuestions = question;
        this.uniqueQuestions = this.allQuestions.filter(question => !this.testQuestions.some(testQuestion => testQuestion.id === question.id));
      }
    );
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
  addQuestionToTest(question: Question, index: number){
    this.testQuestions.push(question);
    this.uniqueQuestions = this.uniqueQuestions.filter(q => q.id !== question.id);
    if (this.questionIdsToDelete.includes(question.id)){
      this.questionIdsToDelete = this.questionIdsToDelete.filter(q => q !== question.id);
    }
    else{
      this.questionIdsToAdd.push(question.id);
    }
  }

  removeQuestionFromTest(question: Question, index: number){
      this.testQuestions = this.testQuestions.filter(q => q.id !== question.id);
      this.uniqueQuestions.push(question);
      if (this.questionIdsToAdd.includes(question.id)){
        this.questionIdsToAdd = this.questionIdsToAdd.filter(q => q !== question.id);
      }
      else {
        this.questionIdsToDelete.push(question.id);
      }
  }

  async saveQuestions(): Promise<void> {
    const setsToAdd = this.questionIdsToAdd.map(questionId => {
      return {testId: this.currentTest.id, questionId: questionId};
    });

    const setsToDelete = this.questionIdsToDelete.map(questionId => {
      return {testId: this.currentTest.id, questionId: questionId};
    });

    if (setsToAdd.length > 0){
      await this.setService.createAll(setsToAdd).toPromise();
    }

    if (setsToDelete.length > 0){
      await this.setService.deleteAll(setsToDelete).toPromise();
    }
    this.questionIdsToAdd = [];
    this.questionIdsToDelete = [];
  }

  openDialog(question: Question): void {
    const dialogRef = this.dialog.open(QuestionDetailsComponent, {
      data: {currentQuestion: question },
      width: '80vw',
      height: '80vh'
    });
    dialogRef.afterClosed();
  }

}
