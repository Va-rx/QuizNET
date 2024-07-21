import { Component, OnInit } from '@angular/core';
import { TestService } from 'src/app/services/test/test.service';
import { Test } from 'src/app/models/test.model';
import { Question } from 'src/app/models/question.model';
import { QuestionService } from 'src/app/services/question/question.service';
import { SetService } from 'src/app/services/set/set.service';

@Component({
  selector: 'app-test-details',
  templateUrl: './test-details.component.html',
  styleUrls: ['./test-details.component.css']
})
export class TestDetailsComponent implements OnInit {
  test: Test = new Test();
  questions: Question[] = [];
  selectedQuestion: Question = new Question();

  isEditable = false;

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
  }

  toggleEdit() {
    this.isEditable = !this.isEditable;
  }
}
