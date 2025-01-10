import { Component } from '@angular/core';
import Phaser from 'phaser';
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
import { Question } from 'src/app/models/question.model';

@Component({
  selector: 'app-platform-game',
  templateUrl: './platform-game.component.html',
  styleUrls: ['./platform-game.component.css']
})
export class PlatformGameComponent {
  phaserGame!: Phaser.Game;
  config!: Phaser.Types.Core.GameConfig;

  test: Test = new Test();
  points: number = 0;
  bonusPoints: number = 0;
  historyTestId!: number;

  levelsData: any;

  maxBonusFruits: number = 0;

  maxBonusFruitsPoints: number = 0;
  maxLevelNoDeathPoints: number = 0;
  maxLevelSpeedPoints: number = 0;

  pointsPerBonusFruit: number = 0;
  pointsPerNoDeathLevel: number = 0;
  pointsPerLevelSpeed: number = 0;

  timeForGame: number = 0;
  secondsWhenStartedLevel: number = 0;

  nickname!: string;
  scoreBoardMap: Map<string, [number, number]> = new Map<string, [number, number]>();
  scoreBoard: any[] = [];

  gameFinished = false;

  bonusFruitsCollected: number = 0;
  achieverScore: number = 0;

  socket: any;
  currentServerSeconds: number = 0;
  shuffleQuestions: boolean = false;
  shuffleAnswers: boolean = false;
  maxQuestions: number = 0;

  timeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(private testService: TestService, 
              private dialog: MatDialog, 
              private socketService: SocketServiceService,
              private userAnswersService: UserAnswersService,
              private userResultsService: UserResultsService,
              private userPersonalityResultsService: UserPersonalityResultsService,
              private auth: AuthService,
              private navbarService: NavbarService) {}
  
  async ngAfterViewInit() {
    this.test = await this.getTestDetails();
    this.levelsData = await history.state.data.levelsData;

    const bonuses = history.state.data.bonuses;
    this.calculateMaxBonusFruitsOnTest();
    this.calculateMaxBonuses(bonuses);

    this.timeForGame = history.state.data.timer;
    this.secondsWhenStartedLevel = this.timeForGame;
    this.historyTestId = history.state.data.testHistoryId;
    this.shuffleQuestions = history.state.data.shuffleQuestions;
    this.shuffleAnswers = history.state.data.shuffleAnswers;
    this.maxQuestions = history.state.data.maxQuestions;
    this.nickname = this.auth.getNickname();
    this.socket = this.socketService.getSocket();

    this.navbarService.hideNavbar();

    this.config = {
      type: Phaser.AUTO,
      height: 960,
      width: 1600,
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
      scene: new platformerScene({key: 'platformerScene'}, this.levelsData),
    };

    this.startListeningToServerSockets();

    this.phaserGame = new Phaser.Game(this.config);

    this.phaserGame.events.emit("getTimer", this.timeForGame, this.test.questions.length);
    this.phaserGame.events.emit("set_ui_max_level", this.test.questions.length);

    this.startListeningToGameEvents();
  };

  ngOnDestroy(): void {
    this.phaserGame.destroy(true);
  }

  async getTestDetails() {
    const testId = history.state.data.testId;
    return await this.testService.getTestDetails(testId).toPromise();
  }

  async finishGame() {
    let results = JSON.parse(this.userAnswersService.getWrappedResult(this.historyTestId));
    results.score = Math.round(this.points * 100) / 100;
    let createdResults = await this.userResultsService.create(results).toPromise();

    this.socket.emit('userScoreUpdate', this.socketService.getUserId(), this.points, this.socketService.getJoinCode(), true);
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
    this.phaserGame.destroy(true);
  }

  onTimerEnded(){
    this.finishGame();
  }

  calculateMaxBonusFruitsOnTest() {
    this.levelsData.forEach(levelData => {
      this.maxBonusFruits += levelData.bonusFruits;
    });
  }

  calculateMaxBonuses(bonuses: any) {
    this.maxBonusFruitsPoints = Math.round(bonuses['PLATFORMER.BONUS_FRUITS_BONUS'] * this.test.maxPoints * 100) / 100;
    this.maxLevelNoDeathPoints = Math.round(bonuses['PLATFORMER.NO_DEATH_LEVEL_BONUS'] * this.test.maxPoints * 100) / 100;
    this.maxLevelSpeedPoints = Math.round(bonuses['PLATFORMER.LEVEL_SPEED_BONUS'] * this.test.maxPoints * 100) / 100;

    this.pointsPerBonusFruit = Math.round((this.maxBonusFruitsPoints) / (this.maxBonusFruits) * 100) / 100;
    this.pointsPerNoDeathLevel = Math.round((this.maxLevelNoDeathPoints) / (this.test.questions.length) * 100) / 100;
    this.pointsPerLevelSpeed = Math.round((this.maxLevelSpeedPoints) / (this.test.questions.length) * 100) / 100;
  }

  startListeningToServerSockets() {
    this.socket.on('broadcastScoreBoard', (jsonScoreBoard) => {
      this.scoreBoardMap = new Map(Object.entries(JSON.parse(jsonScoreBoard)));
      this.scoreBoard = Object.entries(JSON.parse(jsonScoreBoard)).map(([username, score]) => ({ username, score }));
    });

    this.socket.on("timer-update",(timeValue)=>{
      this.currentServerSeconds = timeValue;
    });
  }

  startListeningToGameEvents() {
    this.phaserGame.scene.game.events.on('startedLevel', (level) => {
      setTimeout(() => {
        this.secondsWhenStartedLevel = this.currentServerSeconds;
        this.stopDetectingLevelTimeOut();
        this.detectLevelTimeOut(level);
      }, 1000)
    })

    this.phaserGame.scene.game.events.on('finishLevel', (level, deaths: number) => {
      this.phaserGame.pause();
      this.stopDetectingLevelTimeOut();
      const spentTime = this.secondsWhenStartedLevel - this.currentServerSeconds;
      if (spentTime <= (this.levelsData[level-1].time)/3 * 60) { 
        this.bonusPoints += this.pointsPerLevelSpeed;
        this.points += this.pointsPerLevelSpeed;
      }

      if (deaths === 0) {
        this.bonusPoints += this.pointsPerNoDeathLevel;
        this.points += this.pointsPerNoDeathLevel;
      }

      let question;
      if (this.shuffleQuestions) {
        question = this.getRandomQuestion();
        if (question == null) {
          console.error("No more questions to ask");
          return;
        }
      } else {
          question = this.test.questions[level-1];
      }

      const dialogRef = this.dialog.open(QuestionViewComponent, {
        
        data: { id: question.id, shuffleAnswers: this.shuffleAnswers },
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(result => {
        this.points += result;
        this.socket.emit('userScoreUpdate', this.socketService.getUserId(), this.points, this.socketService.getJoinCode(), false);
        if (level >= this.maxQuestions) {
          this.finishGame();
        }

        this.phaserGame.resume();
        this.phaserGame.events.emit("nextLevel");
      });
    });

    this.phaserGame.scene.game.events.on('bonusFruitCollected', () => {
      this.bonusFruitsCollected +=1;
      
      this.bonusPoints += this.pointsPerBonusFruit;
      this.points += this.pointsPerBonusFruit;

      this.socket.emit('userScoreUpdate', this.socketService.getUserId(), this.points, this.socketService.getJoinCode(), false);
    });
  }

  getRandomQuestion(): Question | null {
      if (this.test.questions.length === 0) {
        return null;
      }
      const randomIndex = Math.floor(Math.random() * this.test.questions.length);
      const question = this.test.questions[randomIndex];
      this.test.questions.splice(randomIndex, 1);
      return question;
  }

  stopDetectingLevelTimeOut() {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  detectLevelTimeOut(level: number) {
    const maxTime = this.levelsData[level-1].time * 60
    if (this.secondsWhenStartedLevel - this.currentServerSeconds >= maxTime) {
      this.phaserGame.events.emit("finishLevel", level, 999);
    } else {
      this.timeoutId = setTimeout(() => this.detectLevelTimeOut(level), 1000);
    }
  }
}

