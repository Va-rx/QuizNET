import { Component, OnInit } from '@angular/core';
import { TestService } from 'src/app/services/test/test.service';
import { Test } from 'src/app/models/test.model';
import { Question } from 'src/app/models/question.model';
import { QuestionService } from 'src/app/services/question/question.service';
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

  isEditable = false;
  isEditing = false;
  tempName!: string;

  @ViewChild('inputElement', { static: false }) inputElement!: ElementRef;

  
  editTest() {
    this.isEditing = true;
    this.tempName = this.test.name;
    setTimeout(() => this.inputElement.nativeElement.focus());
  }
  
  cancelTestLabelChange() {
    this.isEditing = false;
  }
  
  saveTestLabelChange() {
    this.isEditing = false;
    this.test.name = this.tempName;
  }



  constructor (private TestService: TestService, private QuestionService: QuestionService, private SetService: SetService) { }

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
  }

  selectQuestion(question: Question) {
    this.selectedQuestion = question;
    this.selectedTestLabel = false;
  }

  showTestDescr() {
    this.selectedQuestion = null;
    this.selectedTestLabel = true;
  }

  toggleEdit() {
    this.isEditable = !this.isEditable;
  }

  answers = [{ text: '', isCorrect: false }];

toggleCorrect(index: number) {
  this.answers[index].isCorrect = !this.answers[index].isCorrect;
}

addAnswer() {
  this.answers.push({ text: '', isCorrect: false });
}
}
