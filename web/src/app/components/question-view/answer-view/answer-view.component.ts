import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Answer } from 'src/app/models/question.model';

@Component({
  selector: 'app-answer-view',
  templateUrl: './answer-view.component.html',
  styleUrls: ['./answer-view.component.css']
})
export class AnswerViewComponent {
  @Input() answer!: Answer;
  @Output() answers = new EventEmitter<Answer>();
  @Input() isChosen: boolean = false;
  @Input() questionType!: string;

  onClick(): void {
    this.addNewItem(this.answer);
  }

  addNewItem(value: Answer): void {
    this.answers.emit(value);
  }
}
