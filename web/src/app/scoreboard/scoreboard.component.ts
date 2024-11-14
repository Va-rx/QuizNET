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
  @Input() BARTLE_stars_picked: number = 0; // Points for Explorer (max 4)
  @Input() BARTLE_medkits_shared: number = 0; // Points for Socializer (max 10)
  @Input() BARTLE_turrets_destroyed: number = 0; // Points for Achiever (normalized by allTurrets)
  @Input() allTurrets: number = 0; // Total number of turrets for normalization
  @Input() testName: string = '';
  @Input() killerScore: number = 0;
  currentPlayerScore: number = 0;
  currentPlayerScoreOnlyQuestions: number = 0;
  currentPlayerPercentage: number = 0;
  explorerScore: number = 0;
  socializerScore: number = 0;
  achieverScore: number = 0;

  //newOnes, need to calculate them!
  timeLeft: number = 12.37 // current player left time for the test
  everyUserTime: number = 21.3; // array, map of every users time spent on solving test

  constructor() {
  }
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

    // Cap and normalize Bartle scores
    const cappedMedkitsShared = Math.min(this.BARTLE_medkits_shared, 10); // Max 10 for Socializer
    this.explorerScore = (this.BARTLE_stars_picked / 4) * 100; // Max 4 points
    this.socializerScore = (cappedMedkitsShared / 10) * 100; // Max 10 points
    this.achieverScore = (this.BARTLE_turrets_destroyed / this.allTurrets) * 100; // Normalized by total turrets
  }
}
