import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.css']
})
export class ScoreboardComponent implements OnChanges, OnInit {
  @Input() scoreboard: Map<string, number> = new Map<string, number>();
  @Input() currentPlayer: string = '';
  @Input() totalScore: number = 0;//max amount of points
  @Input() BARTLE_stars_picked: number = 0; // Points for Explorer (max 4)
  @Input() BARTLE_medkits_shared: number = 0; // Points for Socializer (max 10)
  @Input() BARTLE_turrets_destroyed: number = 0; // Points for Achiever (normalized by allTurrets)
  @Input() allTurrets: number = 0; // Total number of turrets for normalization
  currentPlayerScore: number = 0;
  currentPlayerPercentage: number = 0;
  explorerScore: number = 0;
  socializerScore: number = 0;
  achieverScore: number = 0;

  ngOnInit() {
    this.scoreboard.set('adam', 20);
    this.scoreboard.set('kacper', 3);
    this.scoreboard.set('ola', 7);
    this.scoreboard.set('agnieszka', 11);
    this.scoreboard.set('gosia', 12);
    this.scoreboard.set('izabela', 21);
    this.scoreboard.set('kuba', 55);
    this.scoreboard.set('grzesiek', 2);
    this.scoreboard.set('borsuk', 3);
    this.scoreboard.set('rolnik', 11);
    this.scoreboard.set('wiktor', 6);
    this.scoreboard.set('sfsdfsdf', 6);
    this.scoreboard.set('wikreqweqwetor', 32312);
    this.scoreboard.set('wikfsdsdftor', 22);
    this.scoreboard.set('wiksdfsdfdtor', 1);
    this.scoreboard.set('wifsdfssdfdktor', 6);
    this.scoreboard.set('wifsdffsdfsdfsdfsktor', 6);
    this.scoreboard.set('wikdfsdfdfsdftor', 6);
    this.scoreboard.set('wisdfsdfsdfsdfsdktor', 6);
    this.scoreboard.set('dasdasdas', 6);
    this.scoreboard.set('dasdasdasfdsfsd', 6);
    this.scoreboard.set('dasssdas', 6);
    this.scoreboard.set('wisadasddfsdfsdfsdktor', 6);

    this.currentPlayer = 'kuba';
  }


  constructor() {
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.calculateScores();
    this.scoreboard.set('adam', 20);
    this.scoreboard.set('kacper', 3);
    this.scoreboard.set('ola', 7);
    this.scoreboard.set('agnieszka', 11);
    this.scoreboard.set('gosia', 12);
    this.scoreboard.set('izabela', 21);
    this.scoreboard.set('kuba', 55);
    this.scoreboard.set('grzesiek', 2);
    this.scoreboard.set('borsuk', 3);
    this.scoreboard.set('rolnik', 11);
    this.scoreboard.set('wiktor', 6);
  }

  calculateScores() {
    console.log(this.currentPlayer);
    console.log(this.scoreboard);
    console.log(this.totalScore);
    this.currentPlayerScore = this.scoreboard.get(this.currentPlayer) || 0;
    console.log(this.currentPlayerScore);
    this.currentPlayerPercentage = (this.currentPlayerScore / this.totalScore) * 100;

    // Cap and normalize Bartle scores
    const cappedMedkitsShared = Math.min(this.BARTLE_medkits_shared, 10); // Max 10 for Socializer
    this.explorerScore = (this.BARTLE_stars_picked / 4) * 100; // Max 4 points
    this.socializerScore = (cappedMedkitsShared / 10) * 100; // Max 10 points
    this.achieverScore = (this.BARTLE_turrets_destroyed / this.allTurrets) * 100; // Normalized by total turrets
  }
}
