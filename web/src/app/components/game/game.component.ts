import { Component, OnInit  } from '@angular/core';
import Phaser from 'phaser';
import Example from './example-scene'; 
import { SocketServiceService } from 'src/app/services/socket-service.service';


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  phaserGame!: Phaser.Game;
  config: Phaser.Types.Core.GameConfig;
  private socket: any;
  scoreBoard:string="";

  constructor(private socketService:SocketServiceService) {
    this.config = {
      type: Phaser.AUTO,
      height: 600,
      width: 800,
      scene: [ Example ], // Use Example scene here
      parent: 'gameContainer',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: {
            x:0,
            y:300
          }
        }
      }
    };
  }

  ngOnInit() {
    this.phaserGame = new Phaser.Game(this.config);
    this.phaserGame.scene.game.events.on('userScoreUpdate',(user_score)=>this.socket.emit('userScoreUpdate',this.socketService.getUserId(),user_score,this.socketService.getJoinCode()),this);
    this.socket=this.socketService.getSocket();
    this.socket.on('broadcastScoreBoard',(jsonScoreBoard) => this.scoreBoard=jsonScoreBoard);
  }

  ngOnDestroy() {
    this.phaserGame.destroy(true);
  }
}
