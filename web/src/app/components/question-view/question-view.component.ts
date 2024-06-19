import {Component, OnInit} from '@angular/core';
import { Answer, Question } from 'src/app/models/question.model';
import { QuestionService } from 'src/app/services/question/question.service';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'app-question-view',
  templateUrl: './question-view.component.html',
  styleUrls: ['./question-view.component.css']
})
export class QuestionViewComponent implements OnInit{

  isMultipleChoice: boolean = false;
  chosenAnswers: Answer[] = [];
  isSubmitted: boolean = false;
  result: number = 0;
  question: Question = new Question();
  constructor(private questionService: QuestionService,@Inject(MAT_DIALOG_DATA) public data: any) {

   }

    ngOnInit(): void {
    this.questionService.getQuestionWithAnswers(this.data.id).subscribe(question => {
        this.question = question;
      });
   }

  chooseAnswer(answer: Answer): void {
    if (this.checkAnswer(answer) && this.isMultipleChoice) {
      this.chosenAnswers = this.chosenAnswers.filter(a => a !== answer);
    }
    else if (!this.checkAnswer(answer) && this.isMultipleChoice) {
      this.chosenAnswers.push(answer);
    }
    else if (!this.checkAnswer(answer) && !this.isMultipleChoice){
      this.chosenAnswers = [answer];
    }
  }

  submitAnswer(): void {
    for (const answer of this.chosenAnswers) {
      if (answer.isCorrect) {
        this.result++;
      }
    }
    this.isSubmitted = true;
  }

  checkAnswer(answer: Answer): boolean {
    return this.chosenAnswers.includes(answer);
  }


}


