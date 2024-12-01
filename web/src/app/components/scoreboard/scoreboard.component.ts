import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.css']
})
export class ScoreboardComponent implements OnChanges {
  @Input() scoreboard: Map<string, number> = new Map<string, number>();
  @Input() currentPlayer: string = '';
  @Input() totalScore: number = 0;//max amount of points
  @Input() bonusScore: number = 0;
  @Input() testName: string = '';
  currentPlayerScore: number = 0;
  currentPlayerScoreOnlyQuestions: number = 0;
  currentPlayerPercentage: number = 0;
  @Input() explorerScore: number = -1;
  @Input() socializerScore: number = -1;
  @Input() achieverScore: number = -1;
  @Input() killerScore: number = -1;

  //newOnes, need to calculate them!
  timeLeft: number = 12.37 // current player left time for the test
  everyUserTime: number = 21.3; // array, map of every users time spent on solving test

  ngOnChanges(changes: SimpleChanges): void {
    this.calculateScores();
  }

  calculateScores() {
    this.currentPlayerScore = this.scoreboard.get(this.currentPlayer) || 0;
    this.currentPlayerPercentage = (this.currentPlayerScore / this.totalScore) * 100;
    this.currentPlayerScoreOnlyQuestions = this.currentPlayerScore - this.bonusScore;

    console.log(this.currentPlayerScore);
    console.log(this.bonusScore)
    console.log(this.currentPlayerScoreOnlyQuestions);
  }

  get sortedScoreboard(): { key: string, value: number }[] {
    return Array.from(this.scoreboard.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([key, value]) => ({ key, value }));
  }
}
