import { Component, OnInit } from '@angular/core';
import Phaser from 'phaser';
import Tanks, { UIScene } from './tank-scene';
import { Question } from 'src/app/models/question.model';
import { QuestionViewComponent } from '../question-view/question-view.component';
import { TestService } from 'src/app/services/test/test.service';
import { SocketServiceService } from 'src/app/services/socket/socket-service.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UserResultsService } from "../../services/user-results/user-results.service";
import { UserAnswersService } from "../../services/user-answers/user-answers.service";
import {UserPersonalityResultsService} from "../../services/user-personality-results/user-personality-results.service";
import {PersonalityResults} from "../../models/user-personality-results";
import { NavbarService } from '../../services/navbar/navbar.service';
@Component({
  selector: 'app-tank-game',
  templateUrl: './tank-game.component.html',
  styleUrls: ['./tank-game.component.css']
})
export class TankGameComponent implements OnInit {
  phaserGame!: Phaser.Game;
  config!: Phaser.Types.Core.GameConfig;
  questions: Question[] = [];
  testID: number = 1;
  testName: string = '';
  historyTestId: number = -1;
  maxLevel: number = -1;
  currentLevel: number = 0;
  scoreBoard: any[] = [];
  playerScore: number = 0;
  playerScoreBonus: number = 0;
  gameFinished: boolean = false;
  scoreBoardMap: Map<string, [number, number]> = new Map<string, [number, number]>();
  nickname: string = "";
  private socket: any;
  starsPicked: number = 0;
  medkitsShared: number = 0;
  turretsDestroyed: number = 0;
  totalTurrets: number = 0;
  testMaxPoints: number = 0;
  timer: number = 900;
  timerEnded:boolean=false;
  timerStarted:boolean=false;
  totalStars:number=0;
  totalHealth:number=0;
  //BARTLE SCOREBOARD//
  explorerScore:number=0;
  socializerScore:number=0;
  achieverScore:number=0;
  levelMap: any;
  startingWidth: number = 0;
  startingHeight: number = 0;
  shuffleQuestions: boolean = false;
  shuffleAnswers: boolean = false;
  
  constructor(private dialog: MatDialog,
    private TestsService: TestService,
    private socketService: SocketServiceService,
    private route: ActivatedRoute,
    private auth: AuthService,
    private userAnswersService: UserAnswersService,
    private userResultsService: UserResultsService, private userPersonalityResultsService: UserPersonalityResultsService,
    private navbarService: NavbarService ) {
      this.startingHeight = Math.min(window.innerHeight - 80, 800);
      this.startingWidth = window.innerWidth
  }

  async ngOnInit() {
    this.navbarService.hideNavbar();
    this.socket = this.socketService.getSocket();
    this.testID=history.state.data.testId;
    this.historyTestId = history.state.data.testHistoryId;
    this.levelMap = history.state.data.levelsData[0].map;
    this.timer=history.state.data.timer;
    this.shuffleQuestions = history.state.data.shuffleQuestions; 
    this.shuffleAnswers = history.state.data.shuffleAnswers;
    this.config = {
      type: Phaser.AUTO,
      height: this.startingHeight,
      width: this.startingWidth,
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
      scene: [new Tanks({key: 'Tanks'}, this.levelMap), UIScene],
    };
    this.nickname = this.auth.getNickname();

    this.phaserGame = new Phaser.Game(this.config);

    await this.loadTestDetails();
    await this.sleep(1000);
    if(!this.timerStarted){
      this.phaserGame.events.emit("getTimer", this.timer,this.maxLevel);
      this.timerStarted=true;
    }
    this.phaserGame.scene.game.events.on('levelCompleted_SpawnQuestion', (id) => {
      let question;
      this.phaserGame.pause();
      if (this.shuffleQuestions) {
        question = this.getRandomQuestion();
        if (question == null) {
          console.error("No more questions to ask");
          return;
        }
      }
      else{
        question = this.questions[this.currentLevel];
      }

      const dialogRef = this.dialog.open(QuestionViewComponent, {
        data: { id: question.id, shuffleAnswers: this.shuffleAnswers},
        disableClose: true
      });
      this.currentLevel++;
      dialogRef.afterClosed().subscribe(result => {
        this.playerScore += result;
        this.socket.emit('userScoreUpdate', this.socketService.getUserId(), this.playerScore, this.socketService.getJoinCode(), false)
        this.phaserGame.resume();
        if (this.currentLevel == this.maxLevel) {
            this.finishGame();
        }
      });
    });

    this.socket.on('broadcastScoreBoard', (jsonScoreBoard) => {
      this.scoreBoardMap = new Map(Object.entries(JSON.parse(jsonScoreBoard)));
      this.scoreBoard = Object.entries(JSON.parse(jsonScoreBoard)).map(([username, score]) => ({ username, score }));
    }

    );

    this.phaserGame.scene.game.events.on('shareHealth', () => {
      this.socket.emit('shareHealth', this.nickname,this.socketService.getJoinCode())
    })

    this.socket.on('receiveHealth', (userName) => {
      this.phaserGame.events.emit("receiveHealth_inPhaser", userName)
    })
  }

  async loadTestDetails() {
    try {
      const data = await this.TestsService.getTestDetails(this.testID).toPromise();
      this.questions = data.questions;
      this.maxLevel = data.questions.length;
      this.testMaxPoints = data.maxPoints;
      this.testName = data.name;
    } catch (error) {
      console.error("Error loading test details:", error);
    }
  }

  sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  onTimerEnded(){
    this.timerEnded=true;
    this.finishGame();
  }

  async finishGame(){
    this.timerEnded=true;
    let results = JSON.parse(this.userAnswersService.getWrappedResult(this.historyTestId));

    this.playerScore += this.phaserGame.scene.getScene("Tanks")["bonus"];
    this.playerScoreBonus=this.phaserGame.scene.getScene("Tanks")["bonus"];
    ////////SET PARAMETERS FOR BARTLE//////
    this.totalHealth= this.phaserGame.scene.getScene("Tanks")["totalApteczkas"];
    this.totalStars= this.phaserGame.scene.getScene("Tanks")["totalStars"];
    this.starsPicked = this.phaserGame.scene.getScene("Tanks")["BARTLE_stars_picked"];
    this.medkitsShared = this.phaserGame.scene.getScene("Tanks")["BARTLE_medkits_shared"];
    this.turretsDestroyed = this.phaserGame.scene.getScene("Tanks")["BARTLE_turrets_destroyed"];
    this.totalTurrets = this.phaserGame.scene.getScene("Tanks")["allTurrets"];
    ///////////////////////////////////////
    this.playerScore = Math.round(this.playerScore * 100) / 100;
    results.score=this.playerScore;
    let createdResults = await this.userResultsService.create(results).toPromise();

    this.socket.emit('userScoreUpdate', this.socketService.getUserId(), this.playerScore, this.socketService.getJoinCode(), true)
    this.phaserGame.destroy(true);
    this.calculateScores();

    let personalityResults: PersonalityResults = {
      userResultsId: createdResults.id,
      explorer: this.explorerScore,
      socializer: this.socializerScore,
      killer: 0,
      achiever: this.achieverScore
    };
    await this.userPersonalityResultsService.create(personalityResults).toPromise();

    this.gameFinished = true;

  }

  calculateScores() {
    const cappedMedkitsShared = Math.min(this.medkitsShared, 10); // Max 10 for Socializer
    if(this.totalStars==0){
      this.explorerScore=0;
    }else{
      this.explorerScore = (this.starsPicked / this.totalStars) * 100; // Max 4 points
    }

    if(this.totalHealth>10){
      this.socializerScore = (cappedMedkitsShared / 10) * 100;
    }
    else{
      this.socializerScore = (this.medkitsShared / this.totalHealth) * 100;
    }
    this.achieverScore = (this.turretsDestroyed / this.totalTurrets) * 100; // Normalized by total turrets
  }

  ngOnDestroy() {
    this.phaserGame.destroy(true);
  }

  getRandomQuestion(): Question | null {
    if (this.questions.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * this.questions.length);
    const question = this.questions[randomIndex];
    this.questions.splice(randomIndex, 1);
    return question;
  }
}

