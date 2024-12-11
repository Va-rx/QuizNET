import {Component, OnInit} from '@angular/core';
import { Answer, Question } from 'src/app/models/question.model';
import { QuestionService } from 'src/app/services/question/question.service';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { UserAnswersService } from "../../services/user-answers/user-answers.service";

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
  max_points_sum = 0;
  question: Question = new Question();
  constructor(private questionService: QuestionService,
              @Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<QuestionViewComponent>,
              private userAnswersService: UserAnswersService) {}

    ngOnInit(): void {
      this.dialogRef.updateSize('40%');
        this.questionService.getQuestion(this.data.id).subscribe(question => {
        this.question = question;
        this.isMultipleChoice = (this.question.type === 'multi');
        this.max_points_sum = question.maxPoints;
        this.question.answers = this.shuffleArray(question.answers);
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
    if (this.userAnswersService.get()){
      this.userAnswersService.update(this.question.id, this.chosenAnswers.map(answer => answer.id ? answer.id: -1));
    }
    else {
      this.userAnswersService.save(this.question.id, this.chosenAnswers.map(answer => answer.id ? answer.id : -1));
    }
    for (const answer of this.chosenAnswers) {
        this.result += answer.points;
    }

    this.result = Math.max(this.result, 0);

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

  getImageUrl(imageData: any): string {
    if (typeof imageData === 'string') {
      return `data:image/jpeg;base64,${imageData}`;
    } else if (imageData instanceof Blob) {
      return URL.createObjectURL(imageData);
    }
    return '';
  }

  shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

