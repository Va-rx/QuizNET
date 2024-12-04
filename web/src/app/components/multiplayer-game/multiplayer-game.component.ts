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
import {PersonalityResults} from "../../models/user-personality-results";
import {UserPersonalityResultsService} from "../../services/user-personality-results/user-personality-results.service";
import { NavbarService } from 'src/app/services/navbar/navbar.service';

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
  levelMap: any;

  timer: number = 900; //IN SECONDS
  timerEnded:boolean=false;
  timerStarted:boolean=false;

  constructor(private socketService:SocketServiceService,
              private dialog: MatDialog,
              private testService: TestService,
              private auth: AuthService,
              private userAnswersService: UserAnswersService,
              private userResultsService: UserResultsService,
              private userPersonalityResultsService: UserPersonalityResultsService,
            private navbarService: NavbarService) {
    this.nickname = this.auth.getNickname();
  }

  async ngOnInit(): Promise<void> {
    this.navbarService.hideNavbar();
    this.socket=this.socketService.getSocket();
    this.testId=history.state.data.testId;
    this.historyTestId = history.state.data.testHistoryId;
    this.players = history.state.data.multiplayerPlayers;
    this.maxQuestions = history.state.data.maxQuestions;
    this.levelMap = history.state.data.levelsData[0].map;
    this.timer=history.state.data.timer;

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
      scene: new multiplayerScene({key: 'multiplayerScene'}, this.socket, this.players, this.maxQuestions, this.levelMap),
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
      }
    };
    this.phaserGame = new Phaser.Game(this.config);
    await this.loadTestDetails()

    if(!this.timerStarted){
      this.phaserGame.events.emit("getTimer", this.timer,this.maxQuestions);
      this.timerStarted=true;
    }

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

  onTimerEnded(){
    this.timerEnded=true;
    this.finishGame();
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

  async finishGame(){
    let results = JSON.parse(this.userAnswersService.getWrappedResult(this.historyTestId));
    results.score = Math.round(this.playerScore * 100) / 100;
    let createdResults = await this.userResultsService.create(results).toPromise();

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
    dialogRef.afterClosed().subscribe(async (result: ShareHealthAnswer) => {
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

      let personalityResults: PersonalityResults = {
        userResultsId: createdResults.id,
        explorer: 0,
        socializer: this.socializerScore,
        killer: this.killerScore,
        achiever: 0
      };
      await this.userPersonalityResultsService.create(personalityResults).toPromise();
    });

    this.phaserGame.destroy(true);
    this.gameFinished = true;
    this.timerEnded=true;
  }
}
