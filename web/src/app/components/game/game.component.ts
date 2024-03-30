import { Component, OnInit  } from '@angular/core';
import Phaser from 'phaser';
import Example from './example-scene'; 


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  phaserGame!: Phaser.Game;
  config: Phaser.Types.Core.GameConfig;

  constructor() {
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
  }

  ngOnDestroy() {
    this.phaserGame.destroy(true);
  }
}
