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
      height: 600,
      width: 800,
      // height: window.innerHeight,
      // width: window.innerWidth,
      physics: {
        default: 'arcade',
        arcade: {
          debug: true,
          gravity: { x: 0, y: 1200}
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

