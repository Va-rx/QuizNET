import { Component,OnInit } from '@angular/core';
import Phaser from 'phaser';
import Tanks, { UIScene } from './tank-scene';
import { Question } from 'src/app/models/question.model';
import { QuestionService } from 'src/app/services/question.service';
import { AnswerService } from 'src/app/services/answer.service';
import { QuestionViewComponent } from '../question-view/question-view.component';

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
export class TankGameComponent implements OnInit{
  phaserGame!: Phaser.Game;
  config: Phaser.Types.Core.GameConfig;
  questions?: Question[];

  constructor(private questionService: QuestionService,private answerService: AnswerService,private dialog: MatDialog) {
    this.config = {
      type: Phaser.AUTO,
      height: 768,
      width: 1280,
      physics: {
        default: 'matter',
        matter: {
          debug: false,
          gravity:{
            x:0,
            y:0
          }
        },


      },
      fps: {
        target: 60,
        forceSetTimeOut: true
      },
      scene: [ Tanks ,UIScene], // Use Example scene here
    };
  }

  ngOnInit() {
    this.phaserGame = new Phaser.Game(this.config);
    this.phaserGame.scene.game.events.on('levelCompleted_SpawnQuestion',(id)=>{
      const dialogRef = this.dialog.open(QuestionViewComponent, {
        data: { id: id }
      });
    });


  }
  ngOnDestroy() {
    this.phaserGame.destroy(true);
  }
}
