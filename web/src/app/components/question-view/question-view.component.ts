import {Component, OnInit} from '@angular/core';
import { Answer, Question } from 'src/app/models/question.model';
import { QuestionService } from 'src/app/services/question/question.service';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-question-view',
  templateUrl: './question-view.component.html',
  styleUrls: ['./question-view.component.css']
})
export class QuestionViewComponent implements OnInit{
2
  isMultipleChoice: boolean = false;
  chosenAnswers: Answer[] = [];
  isSubmitted: boolean = false;
  result: number = 0;
  max_points_sum=1;
  question: Question = new Question();
  constructor(private questionService: QuestionService,@Inject(MAT_DIALOG_DATA) public data: any,  public dialogRef: MatDialogRef<QuestionViewComponent>
) {

   }

    ngOnInit(): void {
    this.questionService.getQuestionWithAnswers(this.data.id).subscribe(question => {
        this.question = question;
        this.isMultipleChoice = this.determineIfMultipleChoice(question.answers);
      });
   }

   determineIfMultipleChoice(answers: Answer[]|undefined): boolean {
    if (answers) {
      this.max_points_sum=answers.filter(answer => answer.isCorrect).length;
      return answers.filter(answer => answer.isCorrect).length > 1;
    }
    else {
      return false;
    }
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
      else {
        this.result=Math.max(0,this.result-1);
      }
    }

    this.result=this.result/this.max_points_sum;
    //round to 2 decimal places
    this.result = Math.round(this.result * 100) / 100;
    this.isSubmitted = true;
    setTimeout(() => {
      this.closeDialog();
    }, 2000);
  }

  checkAnswer(answer: Answer): boolean {
    return this.chosenAnswers.includes(answer);
  }

  closeDialog(): void {
    const result = this.result;
    this.dialogRef.close(result);
  }
}


