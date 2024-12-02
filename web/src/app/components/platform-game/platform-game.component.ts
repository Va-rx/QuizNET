import { Component, OnDestroy, OnInit } from '@angular/core';
import Phaser, {Scene} from 'phaser';
import platformerScene from './platformer-scene';
import { Test } from 'src/app/models/test.model';
import { TestService } from 'src/app/services/test/test.service';
import { QuestionViewComponent } from '../question-view/question-view.component';
import { MatDialog } from '@angular/material/dialog';
import { SocketServiceService } from 'src/app/services/socket/socket-service.service';
import { UserAnswersService } from 'src/app/services/user-answers/user-answers.service';
import { UserResultsService } from 'src/app/services/user-results/user-results.service';
import { PersonalityResults } from 'src/app/models/user-personality-results';
import { UserPersonalityResultsService } from 'src/app/services/user-personality-results/user-personality-results.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { NavbarService } from 'src/app/services/navbar/navbar.service';

@Component({
  selector: 'app-platform-game',
  templateUrl: './platform-game.component.html',
  styleUrls: ['./platform-game.component.css']
})
export class PlatformGameComponent {
  phaserGame!: Phaser.Game;
  config!: Phaser.Types.Core.GameConfig;

  test: Test = new Test();
  score: number = 0;
  maxBonusPoints: number = 2;
  bonusPoints: number = 0;
  socket: any;
  historyTestId!: number;
  gameFinished = false;
  nickname!: string;

  scoreBoardMap: Map<string, number> = new Map<string, number>();
  scoreBoard: any[] = [];

  maxBonusFruits: number = 2;
  bonusFruitsCollected: number = 0;
  achieverScore: number = 0;

  timer: number = 900; //IN SECONDS
  timerEnded:boolean=false;
  timerStarted:boolean=false;

  constructor(private testService: TestService, 
              private dialog: MatDialog, 
              private socketService: SocketServiceService,
              private userAnswersService: UserAnswersService,
              private userResultsService: UserResultsService,
              private userPersonalityResultsService: UserPersonalityResultsService,
              private auth: AuthService,
              private navbarService: NavbarService) {}
  
  

  async ngAfterViewInit() {
    this.config = {
      type: Phaser.AUTO,
      height: 960,
      width: 1600,
      backgroundColor: 'red',
      parent: 'phaser-game',
      pixelArt: true,
      scale: {
        mode: Phaser.Scale.FIT,
    },
      transparent: true,
      physics: {
        default: 'arcade',
        arcade: {
          debug: false,
          gravity: { x: 0, y: 1200},
          tileBias: 64
        }
      },
      scene: new platformerScene({key: 'platformerScene'}),
    };

    this.navbarService.hideNavbar();

    this.nickname = this.auth.getNickname();
    this.historyTestId = history.state.data.testHistoryId;
    this.timer=history.state.data.timer;
    this.socket = this.socketService.getSocket();
    this.phaserGame = new Phaser.Game(this.config);
    await this.loadTestDetails();

    this.phaserGame.scene.game.events.on('finishLevel', (level) => {
      this.phaserGame.pause();

      const dialogRef = this.dialog.open(QuestionViewComponent, {
        data: { id: this.test.questions[level-1].id },
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(result => {
        this.score += result;
        this.socket.emit('userScoreUpdate', this.socketService.getUserId(), this.score, this.socketService.getJoinCode());
        if (level >= this.test.questions.length) {
          this.finishGame();
        }

        this.phaserGame.resume();
        console.log('NASTEPNY LEVEL WYSYLAM EMIT')
        this.phaserGame.events.emit("nextLevel");
      });
    });

    if(!this.timerStarted){
      this.phaserGame.events.emit("getTimer", this.timer, this.test.questions.length);
      this.timerStarted=true;
    }

    this.phaserGame.scene.game.events.on('bonusFruitCollected', () => {
      this.bonusFruitsCollected +=1;
      const earnedBonusPoints = (this.maxBonusPoints) / (this.maxBonusFruits);
      this.bonusPoints += earnedBonusPoints;
      this.score += earnedBonusPoints;
      this.socket.emit('userScoreUpdate', this.socketService.getUserId(), this.score, this.socketService.getJoinCode());
    })

    this.socket.on('broadcastScoreBoard', (jsonScoreBoard) => {
      this.scoreBoardMap = new Map(Object.entries(JSON.parse(jsonScoreBoard)));
      this.scoreBoard = Object.entries(JSON.parse(jsonScoreBoard)).map(([username, score]) => ({ username, score }));
    });
  };

  ngOnDestroy(): void {
    this.phaserGame.destroy(true);
  }

  async loadTestDetails() {
    const testId = history.state.data.testId;
    const res = await this.testService.getTestDetails(testId).toPromise();
    this.test.questions = res.questions;
    this.test.maxPoints = res.maxPoints;
    this.test.name = res.name;
  }

  async finishGame() {
    let results = JSON.parse(this.userAnswersService.getWrappedResult(this.historyTestId));
    results.score = Math.round(this.score * 100) / 100;
    let createdResults = await this.userResultsService.create(results).toPromise();

    this.socket.emit('userScoreUpdate', this.socketService.getUserId(), this.score, this.socketService.getJoinCode());
    this.achieverScore = (this.bonusFruitsCollected) / (this.maxBonusFruits) * 100
    let personalityResults: PersonalityResults = {
      userResultsId: createdResults.id,
      explorer: 0,
      socializer: 0,
      killer: 0,
      achiever: this.achieverScore
    };
    await this.userPersonalityResultsService.create(personalityResults).toPromise();
    this.gameFinished = true;
    this.timerEnded=true;
  }

  onTimerEnded(){
    this.timerEnded=true;
    this.finishGame();
  }
}

