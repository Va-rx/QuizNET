import { Component, OnInit } from '@angular/core';
import { TestService } from 'src/app/services/test/test.service';
import { Test} from 'src/app/models/test.model';
import { Set } from 'src/app/models/set.model';
import { Answer, Question } from 'src/app/models/question.model';
import { SetService } from 'src/app/services/set/set.service';
import { ViewChild, ElementRef } from '@angular/core';
import { QuestionService } from 'src/app/services/question/question.service';
import { AnswerService } from 'src/app/services/answer/answer.service';

@Component({
  selector: 'app-test-details',
  templateUrl: './test-details.component.html',
  styleUrls: ['./test-details.component.css']
})
export class TestDetailsComponent implements OnInit {
  test: Test = new Test();
  tempQuestions: Question[] = [];
  questions: Question[] = [];
  answersToSelectedQuestion: Answer[] = [];

  selectedQuestion: Question | null = null;
  selectedTestLabel: boolean = true;

  isEditingTestLabel = false;
  isEditingTestDescr = false;
  tempLabel!: string;
  tempDescr?: string;
  latestTempLabel!: string;
  latestTempDescr?: string;

  //
  isEditingTestQuestion = false;
  tempQuestion!: string;
  latestTempQuestion!: string;
  tempAnswers: Answer[] = [];

  constructor (private TestService: TestService, private SetService: SetService, private QuestionService: QuestionService, private AnswerService: AnswerService) { }

  ngOnInit() {
    this.TestService.getSelectedTest().subscribe(test => {
      if (test !== null) {
        this.test = test;
        this.SetService.getQuestionsByTestId(this.test.id).subscribe(questions => {
          this.questions = questions;
          this.tempQuestions = JSON.parse(JSON.stringify(this.questions));
        });
      }
      else {
        throw new Error('Test is null');
      }
    });
    this.tempLabel = this.test.name;
    this.tempDescr = this.test.description;
    this.latestTempLabel = this.test.name;
    this.latestTempDescr = this.test.description;
  }
  
  @ViewChild('inputElement', { static: false }) inputElement!: ElementRef;

  
  editTestLabel() {
    this.isEditingTestLabel = true;
    setTimeout(() => this.inputElement.nativeElement.focus());
  }
  
  editTestDescr() {
    this.isEditingTestDescr = true;
    setTimeout(() => this.inputElement.nativeElement.focus());
  }
  
  cancelTestDescrChange() {
    this.isEditingTestDescr = false;
    this.tempDescr = this.latestTempDescr;
  }
  
  saveTestDescrChange() {
    this.isEditingTestDescr = false;
    this.latestTempDescr = this.tempDescr;
  }
  
  cancelTestLabelChange() {
    this.isEditingTestLabel = false;
    this.tempLabel = this.latestTempLabel;
  }
  
  saveTestLabelChange() {
    this.isEditingTestLabel = false;
    this.latestTempLabel = this.tempLabel;
  }

  saveChanges() {
    let updatedTest: Test = new Test();
    updatedTest.id = this.test.id;
    updatedTest.name = this.tempLabel;
    updatedTest.description = this.tempDescr;
    this.TestService.updateTest(this.test.id, updatedTest).subscribe(() => {
      this.test = updatedTest;
    }, error => {
      alert('Error while updating test' + error.message);
    });
  }

  showTestDescr() {
    this.selectedQuestion = null;
    this.selectedTestLabel = true;
  }

  areNewChanges() {
    return this.tempLabel !== this.test.name|| this.tempDescr !== this.test.description;
  }


  selectQuestion(question: Question) {
    this.selectedQuestion = question;
    this.selectedTestLabel = false;

    this.answersToSelectedQuestion = question.answers || [];
    this.tempAnswers = JSON.parse(JSON.stringify(this.answersToSelectedQuestion));
    this.tempQuestion = this.selectedQuestion.question;
    this.latestTempQuestion = this.tempQuestion;
  }



toggleCorrect(index: number) {
  this.tempAnswers[index].isCorrect = !this.tempAnswers[index].isCorrect;
}

addAnswer() {
  if (this.selectedQuestion !== null)
  this.tempAnswers.push({ answer: '', isCorrect: false, questionId: this.selectedQuestion.id});
}

  ///////////////////////////////////////////////////


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



  async saveAnswerChanges(): Promise<void> {
    if (this.tempQuestions.length !== this.questions.length) {
      this.tempQuestions[this.tempQuestions.length - 1].question = this.tempQuestion;
      this.tempQuestions[this.tempQuestions.length - 1].answers = this.tempAnswers;
      console.log("creating");
      
      this.QuestionService.create(this.tempQuestions[this.tempQuestions.length - 1]).toPromise();
      let set = new Set();
      set.questionId = this.tempQuestions[this.tempQuestions.length - 1].id
      set.testId = this.test.id;
      this.SetService.create(set).toPromise();
      return;
    }


    if (this.selectedQuestion !== null) {
      this.selectedQuestion.question = this.tempQuestion;
      this.selectedQuestion.answers = this.tempAnswers;
      console.log(this.selectedQuestion);
      
      await this.QuestionService.update(this.selectedQuestion.id, this.selectedQuestion).toPromise();
    }
  }

  areNewAnswerChanges() { 
    return this.tempQuestion !== this.selectedQuestion?.question || !areArraysEqual(this.tempAnswers, this.answersToSelectedQuestion);
  }

  async deleteQuestion() {    
    if (this.tempQuestions.length +1 === this.questions.length) {
      this.tempQuestions = this.questions;
    }
    if (this.selectedQuestion !== null) {
      await this.QuestionService.delete(this.selectedQuestion.id).subscribe();
    }
  }

  async deleteTest() {
    if (this.test !== null) {
      await this.TestService.delete(this.test.id).subscribe();
    }
  }

  async deleteAnswer(id: number) {
    this.tempAnswers.splice(id, 1);
  }

  addQuestion() {
    let question = new Question();
    this.tempQuestions.push(question);
  }
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
