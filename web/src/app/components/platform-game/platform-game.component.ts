import { Component, OnDestroy, OnInit } from '@angular/core';
import Phaser, {Scene} from 'phaser';
import platformerScene from './platformer-scene';
import { Test } from 'src/app/models/test.model';
import { TestService } from 'src/app/services/test/test.service';
import { QuestionViewComponent } from '../question-view/question-view.component';
import { MatDialog } from '@angular/material/dialog';
import { SocketServiceService } from 'src/app/services/socket/socket-service.service';
import { Socket } from 'socket.io-client';
import { UserAnswersService } from 'src/app/services/user-answers/user-answers.service';
import { UserResultsService } from 'src/app/services/user-results/user-results.service';

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
  socket: any;
  historyTestId!: number;


  scoreBoardMap: Map<string, number> = new Map<string, number>();
  scoreBoard: any[] = [];

  constructor(private testService: TestService, 
              private dialog: MatDialog, 
              private socketService: SocketServiceService,
              private userAnswersService: UserAnswersService,
              private userResultsService: UserResultsService) {}

  ngOnInit() {
    this.historyTestId = history.state.data.testHistoryId;
    this.socket = this.socketService.getSocket();
    this.config = {
      type: Phaser.AUTO,
      // antialias: false,
      height: 960,
      width: 1632,
      // width: window.innerWidth * 0.8,
      // height: window.innerHeight * 0.8,
      // height: window.innerHeight / 2,
      // width: window.innerWidth / 2,
      backgroundColor: 'red',
      parent: 'phaser-game',
      pixelArt: true,
      scale: {
        mode: Phaser.Scale.FIT,
        // autoCenter: Phaser.Scale.CENTER_BOTH
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
    this.phaserGame = new Phaser.Game(this.config);
    this.loadTestDetails();

    this.phaserGame.scene.game.events.on('finishLevel', (level) => {
      this.phaserGame.pause();
      if (level < this.test.questions.length) {
        const dialogRef = this.dialog.open(QuestionViewComponent, {
          data: { id: this.test.questions[level-1].id },
          disableClose: true
        });

        dialogRef.afterClosed().subscribe(result => {
          this.score += result;
          this.socket.emit('userScoreUpdate', this.socketService.getUserId(), this.score, this.socketService.getJoinCode())
          this.phaserGame.resume();
        });
      } else {

      }
    });

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
    console.log(res);
    this.test.questions = res.questions;
    this.test.maxPoints = res.maxPoints;
    this.test.name = res.name;
    console.log(this.test);
  }

  async finishGame() {
    let results = JSON.parse(this.userAnswersService.getWrappedResult(this.historyTestId));
    results.score = Math.round(this.score * 100) / 100;
    let createdResults = await this.userResultsService.create(results).toPromise();

    this.socket.emit('userScoreUpdate', this.socketService.getUserId(), this.score, this.socketService.getJoinCode());

      //     let personalityResults: PersonalityResults = {
      //   userResultsId: createdResults.id,
      //   explorer: 0,
      //   socializer: this.socializerScore,
      //   killer: this.killerScore,
      //   achiever: 0
      // };
      // await this.userPersonalityResultsService.create(personalityResults).toPromise();
    
  }
}

