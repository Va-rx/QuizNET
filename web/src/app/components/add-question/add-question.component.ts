import { Component, OnInit } from '@angular/core';
import { Question } from 'src/app/models/question.model';
import { QuestionService } from 'src/app/services/question.service';

@Component({
  selector: 'app-add-question',
  templateUrl: './add-question.component.html',
  styleUrls: ['./add-question.component.css']
})
export class AddQuestionComponent implements OnInit {

  question: Question = {
    question: '',
    image_link: 'null'
  };
  submitted = false;

  constructor(private questionService: QuestionService) { }

  ngOnInit(): void { }

  saveQuestion(): void {
    const data = {
      question : this.question.question,
      image_link: 'xd'
    };

    this.questionService.create(data)
      .subscribe({
        next: (res) => {
          console.log(res);
          this.submitted = true;
        },
        error: (e) => console.error(e)
      });
  }

  newQuestion(): void {
    this.submitted = false;
    this.question = {
      question: ''
    };
  }
}
