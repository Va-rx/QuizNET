import { Component } from '@angular/core';
import { Answer, Question } from 'src/app/models/question.model';
import { QuestionService } from 'src/app/services/question/question.service';
import { AnswerService } from 'src/app/services/answer/answer.service';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
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

  constructor(private questionService: QuestionService,private answerService: AnswerService,@Inject(MAT_DIALOG_DATA) public data: any) {
    console.log('Received id:', data.id);
    this.loadQuestionWithAnswersById(data.id);//overrides
   }

  mockQuestion: Question = {
    question: ' Maksymalna liczba regeneratorów sygnału w dowolnej topologii wynosi:',
    answers: [{answer: '4', isCorrect: false}, {answer: '5', isCorrect: false}, {answer: '3', isCorrect: false}, {answer: 'nie jest ograniczona', isCorrect: true}]
  };
  loadQuestionWithAnswersById(id: number): void {
    this.questionService.get(id).subscribe(question => {
       console.log(question);
        this.mockQuestion.question = question.question;
    });
    this.answerService.get(id).subscribe(answers => {
      console.log(answers);
      this.mockQuestion.answers = answers.map((answer: any) => {
        return {answer: answer.answer, isCorrect: answer.is_correct};
      });
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


