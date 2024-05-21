import { Component,OnInit } from '@angular/core';
import Phaser from 'phaser';
import Tanks, { UIScene } from './tank-scene';

@Component({
  selector: 'app-tank-game',
  templateUrl: './tank-game.component.html',
  styleUrls: ['./tank-game.component.css']
})
export class TankGameComponent implements OnInit{
  phaserGame!: Phaser.Game;
  config: Phaser.Types.Core.GameConfig;

  constructor() {
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
  }

  ngOnDestroy() {
    this.phaserGame.destroy(true);
  }
}
