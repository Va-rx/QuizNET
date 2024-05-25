import { Component, OnInit } from '@angular/core';
import {Answer, Question} from 'src/app/models/question.model';
import { QuestionService } from 'src/app/services/question.service';
import {AnswerService} from "../../services/answer.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-add-question',
  templateUrl: './add-question.component.html',
  styleUrls: ['./add-question.component.css']
})
export class AddQuestionComponent implements OnInit {

  question: Question = {
    question: '',
    image_link: null

  };
  submitted = false;
  answers: Answer[] = [{ isCorrect: false, answer: '' }, { isCorrect: false, answer: '' }];
  file!: File;

  constructor(private questionService: QuestionService, private answerService: AnswerService, private _snackBar: MatSnackBar) { }

  ngOnInit(): void { }

  async saveQuestion(): Promise<void> {
    const data = {
      question : this.question.question,
      image_link: this.file
    };

    if (!this.validateForm()) {
      return;
    }

    const resultQuestion = await this.questionService.create(data).toPromise();

    if (!resultQuestion) {
      return;
    }

    for (const answer of this.answers) {
      answer.questionId = resultQuestion.question_id;
      await this.answerService.create(answer).toPromise();
    }

    this.submitted = true;

  }

  newQuestion(): void {
    this.submitted = false;
    this.question = {
      question: ''
    };

    this.answers = [];
  }

  addAnswer(): void {
    this.answers.push({answer: '', isCorrect: false});
  }

  deleteAnswer(index: number): void {
    if (this.answers.length === 2){
      return;
    }
    this.answers.splice(index, 1);
  }


  onFileChange(event: any) {
    console.log(event.target.files[0])
    this.file = event.target.files[0]
  }

  validateForm(): boolean {
    if (this.question.question.trim() === '') {
      this._snackBar.open('Pytanie nie może być puste');
      return false;
    }

    if (this.answers.some(answer => answer.answer.trim() === '')) {
      this._snackBar.open('Odpowiedź nie może być pusta');
      return false;
    }

    if (!this.answers.some(answer => answer.isCorrect)) {
      this._snackBar.open('Conajmniej jedna odpowiedź musi być poprawna');
      return false;
    }

    return true;
  }

}
