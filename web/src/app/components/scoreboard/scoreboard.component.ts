import { Component, Input, OnChanges, SimpleChanges,OnInit } from '@angular/core';
import { SocketServiceService } from 'src/app/services/socket/socket-service.service';
import { NavbarService } from '../../services/navbar/navbar.service';

@Component({
  selector: 'app-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.css']
})
export class ScoreboardComponent implements OnChanges,OnInit {
  @Input() scoreboard: Map<string, [number, number]> = new Map<string, [number, number]>();
  @Input() currentPlayer: string = '';
  @Input() totalScore: number = 0;
  @Input() bonusScore: number = 0;
  @Input() testName: string = '';
  currentPlayerScore: number = 0;
  currentPlayerScoreOnlyQuestions: number = 0;
  currentPlayerPercentage: number = 0;
  @Input() explorerScore: number = -1;
  @Input() socializerScore: number = -1;
  @Input() achieverScore: number = -1;
  @Input() killerScore: number = -1;
  private socket: any;

  timeSpent: number = 0;

  constructor(private socketService: SocketServiceService,private navbarService: NavbarService) {
  }
  ngOnInit(){
    this.navbarService.showNavbar();
    this.socket = this.socketService.getSocket();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.calculateScores();
  }

  calculateScores() {
    const playerScore = this.scoreboard.get(this.currentPlayer);
    this.currentPlayerScore = playerScore ? playerScore[0] : 0;
    this.currentPlayerPercentage = (this.currentPlayerScore / this.totalScore) * 100;
    this.currentPlayerScoreOnlyQuestions = this.currentPlayerScore - this.bonusScore;
    this.timeSpent = playerScore ? playerScore[1] : 0;
  }

  get sortedScoreboard(): { key: string, value: [number, number] }[] {
    return Array.from(this.scoreboard.entries())
      .sort((a, b) => b[1][0] - a[1][0])
      .map(([key, value]) => ({ key, value }));
  }
}
