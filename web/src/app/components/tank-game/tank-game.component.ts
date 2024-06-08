import { Component, OnInit } from '@angular/core';
import Phaser from 'phaser';
import Tanks, { UIScene } from './tank-scene';
import { Question } from 'src/app/models/question.model';
import { QuestionService } from 'src/app/services/question.service';
import { AnswerService } from 'src/app/services/answer.service';
import { QuestionViewComponent } from '../question-view/question-view.component';
import { TestsService } from 'src/app/services/tests.service';
import { SocketServiceService } from 'src/app/services/socket-service.service';
import { ActivatedRoute } from '@angular/router';


import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
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
  maxLevel: number = 9;
  currentLevel: number = 0;
  scoreBoard:any[]=[];
  private socket: any;

  constructor(private questionService: QuestionService, private answerService: AnswerService, private dialog: MatDialog, private TestsService: TestsService,private socketService:SocketServiceService,private route:ActivatedRoute) {
    this.config = {
      type: Phaser.AUTO,
    //height as window
      height: Math.min(window.innerHeight-100,800),
      width: window.innerWidth-300,
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
  }

  ngOnInit() {
    this.socket=this.socketService.getSocket();
    this.testID= this.route.snapshot.params["id"];
    this.phaserGame = new Phaser.Game(this.config);
    this.TestsService.get(this.testID).subscribe((data) => {
      data.forEach((element: {
        id: number; question_id: number;
      }) => {
        element.id = element.question_id;
      });
      this.questions = data;
      console.log(this.questions);

    });
    this.phaserGame.scene.game.events.on('levelCompleted_SpawnQuestion', (id) => {
      console.log(this.questions);
      this.socket.emit('userScoreUpdate',this.socketService.getUserId(),id,this.socketService.getJoinCode())
      const dialogRef = this.dialog.open(QuestionViewComponent, {
        data: { id: this.questions[this.currentLevel].id }
      });
      this.currentLevel++;

    });

    this.socket.on('broadcastScoreBoard',(jsonScoreBoard) =>
      {console.log(jsonScoreBoard);
        this.scoreBoard=Object.entries(JSON.parse(jsonScoreBoard)).map(([username, score]) => ({username,score}));
      console.log(this.scoreBoard);}

    );
  }
  ngOnDestroy() {
    this.phaserGame.destroy(true);
  }
}
