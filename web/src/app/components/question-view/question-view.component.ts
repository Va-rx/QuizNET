import { Component } from '@angular/core';
import { Answer, Question } from 'src/app/models/question.model';

@Component({
  selector: 'app-question-view',
  templateUrl: './question-view.component.html',
  styleUrls: ['./question-view.component.css']
})
export class QuestionViewComponent {

  isMultipleChoice: boolean = false;
  chosenAnswers: Answer[] = [];
  isSubmitted: boolean = false;
  result: number = 0;

  mockQuestion: Question = {
    question: ' Maksymalna liczba regeneratorów sygnału w dowolnej topologii wynosi:',
    answers: [{answer: '4', isCorrect: false}, {answer: '5', isCorrect: false}, {answer: '3', isCorrect: false}, {answer: 'nie jest ograniczona', isCorrect: true}]
  };

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


