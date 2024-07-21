import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.css']
})
export class ScoreboardComponent implements OnChanges{
  @Input() scoreboard: Map<string, number> = new Map<string, number>();
  @Input() currentPlayer: string = '';
  @Input() totalScore: number = 0;//max amount of points
  currentPlayerScore: number = 0;
  currentPlayerPercentage: number = 0;
  constructor() {
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.calculateScores();
  }

  calculateScores() {
    console.log(this.currentPlayer);
    console.log(this.scoreboard);
    console.log(this.totalScore);
    this.currentPlayerScore = this.scoreboard.get(this.currentPlayer) || 0;
    console.log(this.currentPlayerScore);
    this.currentPlayerPercentage = (this.currentPlayerScore / this.totalScore) * 100;
  }
}
