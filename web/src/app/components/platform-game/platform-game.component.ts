import { Component, OnDestroy, OnInit } from '@angular/core';
import Phaser, {Scene} from 'phaser';
import platformerScene from './platformer-scene';

@Component({
  selector: 'app-platform-game',
  templateUrl: './platform-game.component.html',
  styleUrls: ['./platform-game.component.css']
})
export class PlatformGameComponent {
  phaserGame!: Phaser.Game;
  config!: Phaser.Types.Core.GameConfig;

  ngOnInit() {
    this.config = {
      type: Phaser.AUTO,
      // antialias: false,
      height: 960,
      width: 1632,
      // width: window.innerWidth * 0.8,
      // height: window.innerHeight * 0.8,
      // height: window.innerHeight / 2,
      // width: window.innerWidth / 2,
      backgroundColor: 'red',
      parent: 'phaser-game',
      pixelArt: true,
      scale: {
        mode: Phaser.Scale.FIT,
        // autoCenter: Phaser.Scale.CENTER_BOTH
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
      scene: new platformerScene({key: 'platformerScene'}),
    };
    this.phaserGame = new Phaser.Game(this.config);
  };

  ngOnDestroy(): void {
    this.phaserGame.destroy(true);
  }
}

