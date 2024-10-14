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

@Component({
  selector: 'app-tank-game',
  templateUrl: './tank-game.component.html',
  styleUrls: ['./tank-game.component.css']
})
export class TankGameComponent implements OnInit {
  phaserGame!: Phaser.Game;
  config: Phaser.Types.Core.GameConfig;
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
  scoreBoardMap: Map<string, number> = new Map<string, number>();
  nickname: string = "";
  private socket: any;
  starsPicked: number = 0;
  medkitsShared: number = 0;
  turretsDestroyed: number = 0;
  totalTurrets: number = 0;
  testMaxPoints: number = 0;
  timer: number = 900; //IN SECONDS
  timerEnded:boolean=false;
  timerStarted:boolean=false;

  constructor(private dialog: MatDialog,
    private TestsService: TestService,
    private socketService: SocketServiceService,
    private route: ActivatedRoute,
    private auth: AuthService,
    private userAnswersService: UserAnswersService,
    private userResultsService: UserResultsService) {
    this.config = {
      type: Phaser.AUTO,
      //height as window
      height: Math.min(window.innerHeight - 80, 800),
      width: window.innerWidth,
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
      scene: [Tanks, UIScene], // Use Example scene here
    };
    this.nickname = this.auth.getNickname();
  }

  async ngOnInit() {
    this.socket = this.socketService.getSocket();
    //this.testID= this.route.snapshot.params["id"];
    //this.testID=history.state.data.testId;
    this.testID=1;
    //this.historyTestId = history.state.data.testHistoryId;
    this.phaserGame = new Phaser.Game(this.config);

    //Sometime there is problem with loading it at scene start, this fixes it

    await this.loadTestDetails();
    await this.sleep(1000);
    if(!this.timerStarted){
      this.phaserGame.events.emit("getTimer", this.timer,this.maxLevel);
      this.timerStarted=true;
    }
    this.phaserGame.scene.game.events.on('levelCompleted_SpawnQuestion', (id) => {
      //freeze game for question time
      this.phaserGame.pause();

      const dialogRef = this.dialog.open(QuestionViewComponent, {
        data: { id: this.questions[this.currentLevel].id },
        disableClose: true
      });
      this.currentLevel++;
      dialogRef.afterClosed().subscribe(result => {
        console.log(`Dialog result: ${result}`);
        console.log(result);
        this.playerScore += result;
        this.socket.emit('userScoreUpdate', this.socketService.getUserId(), this.playerScore, this.socketService.getJoinCode())
        //resume game
        this.phaserGame.resume();
        if (this.currentLevel == this.maxLevel) {//REVERT THIS TO ==this.maxLevel for user experience
            this.finishGame();
        }
      });
    });

    this.socket.on('broadcastScoreBoard', (jsonScoreBoard) => {
      console.log(jsonScoreBoard);
      this.scoreBoardMap = new Map(Object.entries(JSON.parse(jsonScoreBoard)));
      this.scoreBoard = Object.entries(JSON.parse(jsonScoreBoard)).map(([username, score]) => ({ username, score }));
      console.log(this.scoreBoard);
    }

    );

    this.phaserGame.scene.game.events.on('shareHealth', () => {
      console.log("SHARING HEALTH WITH OTHER USER")
      console.log(this.nickname)
      this.socket.emit('shareHealth', this.nickname)
    })

    this.socket.on('receiveHealth', (userName) => {
      console.log("You received apteczka from user: " + userName);
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
    console.log("TIMER ENDED IN TANK_GAME");
    this.timerEnded=true;
    this.finishGame();
  }

  finishGame(){
    console.log("Game Over");
    this.timerEnded=true;
    let results = this.userAnswersService.getWrappedResult(this.historyTestId);
    this.userResultsService.create(results).subscribe(data => {
      console.log(data);
    });

    this.playerScore += this.phaserGame.scene.getScene("default")["bonus"];
    ////////SET PARAMETERS FOR BARTLE//////
    this.starsPicked = this.phaserGame.scene.getScene("default")["BARTLE_stars_picked"];
    this.medkitsShared = this.phaserGame.scene.getScene("default")["BARTLE_medkits_shared"];
    this.turretsDestroyed = this.phaserGame.scene.getScene("default")["BARTLE_turrets_destroyed"];
    this.totalTurrets = this.phaserGame.scene.getScene("default")["allTurrets"];
    ///////////////////////////////////////
    this.playerScore = Math.round(this.playerScore * 100) / 100;
    this.socket.emit('userScoreUpdate', this.socketService.getUserId(), this.playerScore, this.socketService.getJoinCode())
    this.phaserGame.destroy(true);
    this.gameFinished = true;
  }

  ngOnDestroy() {
    this.phaserGame.destroy(true);
  }
}

