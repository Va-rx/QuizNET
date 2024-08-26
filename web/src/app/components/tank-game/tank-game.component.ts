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
  playerScore: number = 0;
  gameFinished: boolean = false;
  scoreBoardMap: Map<string, number> = new Map<string, number>();
  nickname: string = "";
  private socket: any;

  constructor( private dialog: MatDialog, private TestsService: TestService,private socketService:SocketServiceService,private route:ActivatedRoute,private auth:AuthService) {
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
    this.nickname=this.auth.getNickname();
  }

  ngOnInit() {
    this.socket=this.socketService.getSocket();
    this.testID= this.route.snapshot.params["id"];
    this.phaserGame = new Phaser.Game(this.config);
    // this.TestsService.get(this.testID).subscribe((data) => {
    //   this.questions = data;
    // });
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
        this.playerScore += result;
        this.socket.emit('userScoreUpdate',this.socketService.getUserId(),this.playerScore,this.socketService.getJoinCode())
        //resume game
        this.phaserGame.resume();
        if(this.currentLevel==this.maxLevel){
          console.log("Game Over");
          this.phaserGame.destroy(true);
          this.gameFinished=true;
        }
      });
    });

    this.socket.on('broadcastScoreBoard',(jsonScoreBoard) =>
      {console.log(jsonScoreBoard);
        this.scoreBoardMap= new Map(Object.entries(JSON.parse(jsonScoreBoard)));
        this.scoreBoard=Object.entries(JSON.parse(jsonScoreBoard)).map(([username, score]) => ({username,score}));
      console.log(this.scoreBoard);}

    );
  }
  ngOnDestroy() {
    this.phaserGame.destroy(true);
  }
}
