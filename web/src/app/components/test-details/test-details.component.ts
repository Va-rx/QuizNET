import { Component, OnInit } from '@angular/core';
import { TestService } from 'src/app/services/test/test.service';
import { Test} from 'src/app/models/test.model';
import { Set } from 'src/app/models/set.model';
import { Answer, Question } from 'src/app/models/question.model';
import { SetService } from 'src/app/services/set/set.service';
import { ViewChild, ElementRef } from '@angular/core';
import { QuestionService } from 'src/app/services/question/question.service';
import { AnswerService } from 'src/app/services/answer/answer.service';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-test-details',
  templateUrl: './test-details.component.html',
  styleUrls: ['./test-details.component.css']
})
export class TestDetailsComponent implements OnInit {
  test: Test = new Test();
  questions: Question[] = [];

  selectedTestDetails: boolean = true;
  selectedTestQuestion: Question | null = null;

  // test details variables

  testTempLabel: string = "";
  testLatestTempLabel: string = "";

  testTempDescription: string = "";
  testLatestTempDescription: string = "";

  isEditingTestLabel = false;
  isEditingTestDescription = false;

  // test question variables

  tempQuestion: string = "";
  latestTempQuestion: string = ""

  questionAnswers: Answer[] = [];
  questionTempAnswers: Answer[] = [];

  isEditingTestQuestion = false;



  @ViewChild('inputElement', { static: false }) inputElement!: ElementRef;

  constructor (private testService: TestService, private setService: SetService, private questionService: QuestionService, private answerService: AnswerService, private route: ActivatedRoute) { }


  async ngOnInit() {
    let id = parseInt(this.route.snapshot.paramMap.get('id')!, 10);
    this.test = await firstValueFrom(this.testService.get(id));
    console.log(this.test);
    this.testTempLabel = this.test.name;
    this.testLatestTempLabel = this.testTempLabel;
  
    this.testTempDescription = this.test.description ?? "";
    this.testLatestTempDescription = this.testTempDescription;

    this.setService.getQuestionsByTestId(this.test.id).subscribe(questions => {
      this.questions = questions;
      console.log("questions:", this.questions);
    })
    // console.log(id);    
    // this.testService.get(id).subscribe(test => {
    //   this.test = test;
    //   console.log(this.test);
    //   this.setService.getQuestionsByTestId(this.test.id).subscribe(questions => {
    //     this.questions = questions;
    //   })
    //   this.testTempLabel = this.test.name;
    //   this.testLatestTempLabel = this.testTempLabel;
  
    //   this.testTempDescription = this.test.description ?? "";
    //   this.testLatestTempDescription = this.testTempDescription;
    // })
  }

  showTestDetails() {
    this.selectedTestQuestion = null;
    this.selectedTestDetails = true;
  }

  
  editTestLabel() {
    this.isEditingTestLabel = true;
    setTimeout(() => this.inputElement.nativeElement.focus());
  }

  cancelTestLabelChange() {
    this.isEditingTestLabel = false;
    this.testTempLabel = this.testLatestTempLabel;
  }
  
  saveTestLabelChange() {
    this.isEditingTestLabel = false;
    this.testLatestTempLabel = this.testTempLabel;
  }
  

  editTestDescription() {
    this.isEditingTestDescription = true;
    setTimeout(() => this.inputElement.nativeElement.focus());
  }
  
  cancelTestDescriptionChange() {
    this.isEditingTestDescription = false;
    this.testTempDescription = this.testLatestTempDescription;
  }
  
  saveTestDescriptionChange() {
    this.isEditingTestDescription = false;
    this.testLatestTempDescription = this.testLatestTempDescription;
  }


  areNewTestDetailsChanges() {
    return this.testTempLabel !== this.test.name|| this.testTempDescription !== this.test.description;
  }

  saveTestDetailsChanges() {
    let updatedTest: Test = new Test();
    updatedTest.id = this.test.id;
    updatedTest.name = this.testTempLabel;
    updatedTest.description = this.testTempDescription;
    this.testService.updateTest(this.test.id, updatedTest).subscribe(() => {
      this.test = updatedTest;
    }, error => {
      alert('Error while updating test' + error.message);
    });
  }


  async deleteTest() {
    if (this.test !== null) {
      await this.testService.delete(this.test.id).subscribe();
    }
  }


// Question handlers


  selectQuestion(question: Question) {
    this.selectedTestQuestion = question;
    this.selectedTestDetails = false;

    this.questionAnswers = question.answers || [];
    this.questionTempAnswers = JSON.parse(JSON.stringify(this.questionAnswers));

    this.tempQuestion = this.selectedTestQuestion.question;
    this.latestTempQuestion = this.tempQuestion;
  }


  editTestQuestion() {
    this.isEditingTestQuestion = true;
    setTimeout(() => this.inputElement.nativeElement.focus());
  }

  saveTestQuestionChange() { 
    this.isEditingTestQuestion = false;
    this.latestTempQuestion = this.tempQuestion;
  }

  cancelTestQuestionChange() { 
    this.isEditingTestQuestion = false;
    this.tempQuestion = this.latestTempQuestion;
  }


  changeGoodFalseAnswer(index: number) {
    this.questionTempAnswers[index].isCorrect = !this.questionTempAnswers[index].isCorrect;
  }

  addAnswer() {
    if (this.selectedTestQuestion !== null) {
      this.questionTempAnswers.push({ answer: '', isCorrect: false, questionId: this.selectedTestQuestion.id});
    } else {
      console.error("Question is null");
    }
  }

  deleteAnswer(id: number) {
    this.questionTempAnswers.splice(id, 1);
  }

  areNewAnswerChanges() { 
    return this.tempQuestion !== this.selectedTestQuestion?.question || !areArraysEqual(this.questionTempAnswers, this.questionAnswers);
  }

  // Better handle that when we dont know if we just modify the existing question or creating a new one. TODO!!!
  async saveAnswerChanges() {
    // if (this.tempQuestions.length)

    // TODO: Update answer changes when deleted answers!!!
    if (this.questionTempAnswers.length >= this.questionAnswers.length) {
      if (this.selectedTestQuestion !== null) {
        this.selectedTestQuestion.question = this.tempQuestion;
        this.selectedTestQuestion.answers = this.questionTempAnswers;
        this.questionAnswers = this.questionTempAnswers;
        await this.questionService.update(this.selectedTestQuestion?.id, this.selectedTestQuestion).toPromise();
      }

    }
  }

  // TODO
  addQuestion() {
    let question = new Question();
    question.question = "New Question";
    this.selectQuestion(question);
  }

  deleteQuestion() {}
  // saveAnswerChanges() {}


  // async saveAnswerChanges(): Promise<void> {
  //   if (this.tempQuestions.length !== this.questions.length) {
  //     this.tempQuestions[this.tempQuestions.length - 1].question = this.tempQuestion;
  //     this.tempQuestions[this.tempQuestions.length - 1].answers = this.tempAnswers;
  //     console.log("creating");
      
  //     this.QuestionService.create(this.tempQuestions[this.tempQuestions.length - 1]).toPromise();
  //     let set = new Set();
  //     set.questionId = this.tempQuestions[this.tempQuestions.length - 1].id
  //     set.testId = this.test.id;
  //     this.SetService.create(set).toPromise();
  //     return;
  //   }


  //   if (this.selectedQuestion !== null) {
  //     this.selectedQuestion.question = this.tempQuestion;
  //     this.selectedQuestion.answers = this.tempAnswers;
  //     console.log(this.selectedQuestion);
      
  //     await this.QuestionService.update(this.selectedQuestion.id, this.selectedQuestion).toPromise();
  //   }
  // }
}

function areArraysEqual(arr1: any[], arr2: any[]): boolean {
  if (arr1.length !== arr2.length) {
    return false;
  }

  return arr1.every((obj1, index) => {
    const obj2 = arr2[index];
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  });
}
