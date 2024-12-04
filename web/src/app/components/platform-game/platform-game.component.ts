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
  levelSpeedPoints: number = 0; // TODO

  nickname!: string;
  scoreBoardMap: Map<string, number> = new Map<string, number>();
  scoreBoard: any[] = [];

  timer: number = 0;
  gameFinished = false;

  bonusFruitsCollected: number = 0;
  achieverScore: number = 0;

  socket: any;

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

    this.timer = history.state.data.timer;
    this.historyTestId = history.state.data.testHistoryId;
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

    this.phaserGame = new Phaser.Game(this.config);

    this.phaserGame.events.emit("getTimer", this.timer, this.test.questions.length);
    this.phaserGame.events.emit("set_ui_max_level", this.test.questions.length);

    this.startListeningToSockets();
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

    this.socket.emit('userScoreUpdate', this.socketService.getUserId(), this.points, this.socketService.getJoinCode());
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
  }

  startListeningToSockets() {
    this.socket.on('broadcastScoreBoard', (jsonScoreBoard) => {
      this.scoreBoardMap = new Map(Object.entries(JSON.parse(jsonScoreBoard)));
      this.scoreBoard = Object.entries(JSON.parse(jsonScoreBoard)).map(([username, score]) => ({ username, score }));
    });

    this.phaserGame.scene.game.events.on('finishLevel', (level, deaths: number) => {
      this.phaserGame.pause();

      if (deaths === 0) {
        this.bonusPoints += this.pointsPerNoDeathLevel;
        this.points += this.pointsPerNoDeathLevel;
      }

      const dialogRef = this.dialog.open(QuestionViewComponent, {
        data: { id: this.test.questions[level-1].id },
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(result => {
        this.points += result;
        this.socket.emit('userScoreUpdate', this.socketService.getUserId(), this.points, this.socketService.getJoinCode());
        if (level >= this.test.questions.length) {
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

      this.socket.emit('userScoreUpdate', this.socketService.getUserId(), this.points, this.socketService.getJoinCode());
    })
  }
}

