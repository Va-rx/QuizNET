import { Component, OnInit } from '@angular/core';
import {Answer, Question} from 'src/app/models/question.model';
import { QuestionService } from 'src/app/services/question.service';
import {AnswerService} from "../../services/answer.service";
import {FileService} from "../../services/file.service";

@Component({
  selector: 'app-add-question',
  templateUrl: './add-question.component.html',
  styleUrls: ['./add-question.component.css']
})
export class AddQuestionComponent implements OnInit {

  question: Question = {
    question: '',
    image_link: ''

  };
  submitted = false;
  answers: Answer[] = [];
  file!: File;

  constructor(private questionService: QuestionService, private answerService: AnswerService, private fileService: FileService) { }

  ngOnInit(): void { }

  async saveQuestion(): Promise<void> {
    const data = {
      question : this.question.question,
      image_link: 'xd'
    };

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
    this.answers.splice(index, 1);
  }


  onFileChange(event: any) {
    console.log(event.target.files[0])
    this.file = event.target.files[0]
  }


}
