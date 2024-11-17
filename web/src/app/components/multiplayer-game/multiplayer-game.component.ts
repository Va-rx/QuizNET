import {Component, OnDestroy, OnInit} from '@angular/core';
import Phaser from "phaser";
import {SocketServiceService} from "../../services/socket/socket-service.service";
import {MatDialog} from "@angular/material/dialog";
import multiplayerScene from "./multiplayer-scene";
import {TestService} from "../../services/test/test.service";
import {QuestionViewComponent} from "../question-view/question-view.component";
import {Test} from "../../models/test.model";
import {RoleDialogComponent} from "./role-dialog/role-dialog.component";
import {Question} from "../../models/question.model";
import {AuthService} from "../../services/auth/auth.service";
import {UserAnswersService} from "../../services/user-answers/user-answers.service";
import {UserResultsService} from "../../services/user-results/user-results.service";
import {ShareHealthAnswer, ShareHealthComponent} from "./share-health/share-health.component";

@Component({
  selector: 'app-multiplayer-game',
  templateUrl: './multiplayer-game.component.html',
  styleUrls: ['./multiplayer-game.component.css']
})
export class MultiplayerGameComponent implements  OnInit, OnDestroy{
  phaserGame!: Phaser.Game;
  config!: Phaser.Types.Core.GameConfig;
  private socket: any;
  testId!: number;
  historyTestId!: number;
  test!: Test;
  roles: string[] = ['offensive', 'defensive'];
  questions: Question[] = []
  maxQuestions: number = -1;
  testMaxPoints: number = 0;
  testName: string = '';
  gameFinished: boolean = false;
  scoreBoardMap: Map<string, number> = new Map<string, number>();
  killBoardMap: Map<string, [string, number]> = new Map<string, [string, number]>();
  killBoard: any[] = [];
  scoreBoard: any[] = [];
  nickname = '';
  playerScore = 0;
  killerScore = 0;
  socializerScore = 0;
  players;

  constructor(private socketService:SocketServiceService,
              private dialog: MatDialog,
              private testService: TestService,
              private auth: AuthService,
              private userAnswersService: UserAnswersService,
              private userResultsService: UserResultsService) {
    this.nickname = this.auth.getNickname();
  }

  async ngOnInit(): Promise<void> {
    this.socket=this.socketService.getSocket();
    this.testId=history.state.data.testId;
    this.historyTestId = history.state.data.testHistoryId;
    this.players = history.state.data.multiplayerPlayers;
    this.maxQuestions = history.state.data.maxQuestions;

    Object.keys(this.players).forEach((key) => {
      this.killBoardMap.set(this.players[key].id, [this.players[key].nickname,0]);
    });

    this.killBoard = Array.from(this.killBoardMap.entries());
    this.config = {
      type: Phaser.AUTO,
      width: 1280,
      height: 720,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      scene: new multiplayerScene({key: 'multiplayerScene'}, this.socket, this.players, this.maxQuestions),
      parent: 'gameContainer',
      physics: {
        default: 'matter',
        matter: {
          debug: false,
          gravity: {
            x: 0,
            y: 0
          }
        },
      },
      fps: {
        target: 60,
        forceSetTimeOut: true
      },
    };
    this.phaserGame = new Phaser.Game(this.config);
    await this.loadTestDetails()

    const roleDialogRef = this.dialog.open(RoleDialogComponent, {
      data: { roles: this.roles, maxQuestions: this.maxQuestions },
      disableClose: true
    });

    roleDialogRef.afterClosed().subscribe(chosenRole => {
      this.socket.emit('roleChosen', chosenRole, this.socket.id);
      this.phaserGame.scene.game.events.emit('enableMovement');
    });

    this.phaserGame.scene.game.events.on('spawnQuestion', (questionsAnswered) => {
      const dialogRef = this.dialog.open(QuestionViewComponent, {
        data: { id: this.questions[questionsAnswered].id },
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(result => {
        this.phaserGame.scene.game.events.emit('questionAnswered');
        this.playerScore += result;
        this.socket.emit('userScoreUpdate', this.socketService.getUserId(), this.playerScore, this.socketService.getJoinCode())
      });
    });

    this.socket.on('broadcastScoreBoard', (jsonScoreBoard) => {
      this.scoreBoardMap = new Map(Object.entries(JSON.parse(jsonScoreBoard)));
      this.scoreBoard = Object.entries(JSON.parse(jsonScoreBoard)).map(([username, score]) => ({ username, score }));
    });


    this.socket.on('playerKilled', (killer)=> {
      if (this.players[killer.killerId]) {
        this.killBoardMap.set(killer.killerId, [this.players[killer.killerId].nickname, killer.killerKills])
        this.killBoard = Array.from(this.killBoardMap.entries());
      }
    })

    this.phaserGame.scene.game.events.on('requestFinishGame', (playersKilled: number) => {
      this.killerScore = ((Math.min(playersKilled, 5)) / 5) * 100;
      this.finishGame();
    });

  }

  ngOnDestroy(): void {
    this.phaserGame.destroy(true);
  }

  async loadTestDetails() {
    try {
      const data = await this.testService.getTestDetails(this.testId).toPromise();
      this.questions = data.questions;
      this.testMaxPoints = data.maxPoints;
      this.testName = data.name;
    } catch (error) {
      console.error("Error loading test details:", error);
    }
  }

  finishGame(){
    let results = JSON.parse(this.userAnswersService.getWrappedResult(this.historyTestId));
    results.score = Math.round(this.playerScore * 100) / 100;
    this.userResultsService.create(results).subscribe(data => {
      console.log("Tu powinien być zwrócony wynik:",data);
    });
    this.socket.emit('userScoreUpdate', this.socketService.getUserId(), this.playerScore, this.socketService.getJoinCode())
    this.socket.off('spawnStar');
    this.socket.off('currentPlayers');
    this.socket.off('currentStars');
    this.socket.off('newPlayer');
    this.socket.off('gameFinished');
    this.socket.off('attackAnimation');
    this.socket.off('playerMoved');
    this.socket.off('playerStarCollected');
    this.socket.off('playerAttacked');
    this.socket.off('playerKilled');
    this.socket.off('playerDisconnected');
    this.socket.off('playerQuestionAnswered');
    this.phaserGame.scene.game.events.off('playerMoved');
    this.phaserGame.scene.game.events.off('chooseRole');
    this.phaserGame.scene.game.events.off('spawnQuestion');
    this.phaserGame.scene.game.events.off('questionAnswered');
    this.phaserGame.scene.game.events.off('requestFinishGame');

    const dialogRef = this.dialog.open(ShareHealthComponent, {
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result: ShareHealthAnswer) => {
      this.socket.emit('MULTIPLAYER_shareHealth', this.socket.id, result);
      switch (result) {
        case ShareHealthAnswer.YES:
        case ShareHealthAnswer.SPLIT:
          this.socializerScore = Math.max(100 - this.killerScore, 20);
          break
        case ShareHealthAnswer.NO:
          this.socializerScore = 0;
          break;

      }
    });

    this.phaserGame.destroy(true);
    this.gameFinished = true;
  }
}
