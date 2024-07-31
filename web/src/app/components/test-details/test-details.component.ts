import { Component, OnInit } from '@angular/core';
import { TestService } from 'src/app/services/test/test.service';
import { Test } from 'src/app/models/test.model';
import { Question } from 'src/app/models/question.model';
import { SetService } from 'src/app/services/set/set.service';
import { ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-test-details',
  templateUrl: './test-details.component.html',
  styleUrls: ['./test-details.component.css']
})
export class TestDetailsComponent implements OnInit {
  test: Test = new Test();
  questions: Question[] = [];

  selectedQuestion: Question | null = null;
  selectedTestLabel: boolean = true;

  isEditingTestLabel = false;
  isEditingTestDescr = false;
  tempLabel!: string;
  tempDescr?: string;
  latestTempLabel!: string;
  latestTempDescr?: string;

  constructor (private TestService: TestService, private SetService: SetService) { }

  ngOnInit() {
    this.TestService.getSelectedTest().subscribe(test => {
      if (test !== null) {
        this.test = test;
        this.SetService.getQuestionsByTestId(this.test.id).subscribe(questions => {
          this.questions = questions;
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
    });
  }

  selectQuestion(question: Question) {
    this.selectedQuestion = question;
    this.selectedTestLabel = false;
  }

  showTestDescr() {
    this.selectedQuestion = null;
    this.selectedTestLabel = true;
  }

  answers = [{ text: '', isCorrect: false }];

toggleCorrect(index: number) {
  this.answers[index].isCorrect = !this.answers[index].isCorrect;
}

addAnswer() {
  this.answers.push({ text: '', isCorrect: false });
}
}
