import {Component, OnDestroy, OnInit} from '@angular/core';
import Phaser, {Scene} from "phaser";
import {SocketServiceService} from "../../services/socket/socket-service.service";
import {MatDialog} from "@angular/material/dialog";
import Example from "../game/example-scene";
import multiplayerScene from "./multiplayer-scene";
import {TestService} from "../../services/test/test.service";
import {QuestionViewComponent} from "../question-view/question-view.component";
import {Test} from "../../models/test.model";
import {RoleDialogComponent} from "./role-dialog/role-dialog.component";
import {Question} from "../../models/question.model";
import {AuthService} from "../../services/auth/auth.service";
import {UserAnswersService} from "../../services/user-answers/user-answers.service";
import {UserResultsService} from "../../services/user-results/user-results.service";
import {ShareHealthComponent} from "./share-health/share-health.component";

@Component({
  selector: 'app-multiplayer-game',
  templateUrl: './multiplayer-game.component.html',
  styleUrls: ['./multiplayer-game.component.css']
})
export class MultiplayerGameComponent implements  OnInit, OnDestroy{
  phaserGame!: Phaser.Game;
  config!: Phaser.Types.Core.GameConfig;
  private socket: any;
  test!: Test;
  roles: string[] = ['offensive', 'defensive'];
  questions: Question[] = []
  maxLevel: number = -1;
  testMaxPoints: number = 0;
  testName: string = '';
  gameFinished: boolean = false;
  scoreBoardMap: Map<string, number> = new Map<string, number>();
  scoreBoard: any[] = [];
  nickname = '';
  playerScore = 0;

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

    this.config = {
      type: Phaser.AUTO,
      width: 1280,
      height: 720,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      scene: new multiplayerScene({key: 'multiplayerScene'}, this.socket, this.nickname),
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
      }
    };
    this.phaserGame = new Phaser.Game(this.config);

    this.socket.on('currentPlayers', (players) => {
      this.phaserGame.scene.game.events.emit('currentPlayers', players);
    });
    await this.loadTestDetails()

    this.phaserGame.scene.game.events.on('chooseRole', (data) => {

      const dialogRef = this.dialog.open(RoleDialogComponent, {
        data: { roles: this.roles },
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(() => {
          this.phaserGame.scene.game.events.emit('enableMovement');
      });
    });

    this.phaserGame.scene.game.events.on('spawnQuestion', (questionsAnswered) => {
      const dialogRef = this.dialog.open(QuestionViewComponent, {
        data: { id: this.questions[0].id },
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(result => {
        this.phaserGame.scene.game.events.emit('questionAnswered');
        this.playerScore += result;
        this.socket.emit('userScoreUpdate', this.socketService.getUserId(), this.playerScore, this.socketService.getJoinCode())
      });
    });

    this.socket.on('broadcastScoreBoard', (jsonScoreBoard) => {
      console.log(jsonScoreBoard);
      this.scoreBoardMap = new Map(Object.entries(JSON.parse(jsonScoreBoard)));
      this.scoreBoard = Object.entries(JSON.parse(jsonScoreBoard)).map(([username, score]) => ({ username, score }));
      console.log(this.scoreBoard);
    });

    this.phaserGame.scene.game.events.on('requestFinishGame', () => {

      this.finishGame();
    });

  }

  ngOnDestroy(): void {
    this.phaserGame.destroy(true);
  }

  async loadTestDetails() {
    try {
      const data = await this.testService.getTestDetails(1).toPromise();
      this.questions = data.questions;
      this.maxLevel = data.questions.length;
      this.testMaxPoints = data.maxPoints;
      this.testName = data.name;
    } catch (error) {
      console.error("Error loading test details:", error);
    }
  }

  finishGame(){
    let results = this.userAnswersService.getWrappedResult(1);
    this.userResultsService.create(results).subscribe(data => {
      console.log(data);
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
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.socket.emit('MULTIPLAYER_shareHealth', this.socketService.getUserId());
      }
    });

    this.phaserGame.destroy(true);
    this.gameFinished = true;
  }
}
