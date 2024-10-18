import {Component, OnDestroy, OnInit} from '@angular/core';
import Phaser, {Scene} from "phaser";
import {SocketServiceService} from "../../services/socket/socket-service.service";
import {MatDialog} from "@angular/material/dialog";
import Example from "../game/example-scene";
import multiplayerScene from "./multiplayer-scene";
import {TestService} from "../../services/test/test.service";
import {QuestionViewComponent} from "../question-view/question-view.component";
import {Test} from "../../models/test.model";
import {RoleDialogComponent} from "./role-dialog/role-dialog.component";

@Component({
  selector: 'app-multiplayer-game',
  templateUrl: './multiplayer-game.component.html',
  styleUrls: ['./multiplayer-game.component.css']
})
export class MultiplayerGameComponent implements  OnInit, OnDestroy{
  phaserGame!: Phaser.Game;
  config!: Phaser.Types.Core.GameConfig;
  private socket: any;
  test!: Test;
  roles: string[] = ['offensive', 'defensive'];

  constructor(private socketService:SocketServiceService, private dialog: MatDialog, private testService: TestService) {
  }

  ngOnInit(): void {
    this.socket=this.socketService.getSocket();
    this.testService.getTestDetails(1).subscribe((data: any) => {
      this.test = data;
    });
    this.config = {
      type: Phaser.AUTO,
      height: 600,
      width: 800,
      scene: new multiplayerScene({key: 'multiplayerScene'}, this.socket),
      parent: 'gameContainer',
      physics: {
        default: 'matter',
        matter: {
          debug: false,
          gravity: {
            x: 0,
            y: 0
          }
        },
      }
    };
    this.phaserGame = new Phaser.Game(this.config);

    this.phaserGame.scene.game.events.on('chooseRole', (data) => {
      const dialogRef = this.dialog.open(RoleDialogComponent, {
        data: { roles: this.roles },
        disableClose: true
      });
    });
    this.phaserGame.scene.game.events.on('spawnQuestion', (data) => {
      console.log('działa')
      const dialogRef = this.dialog.open(QuestionViewComponent, {
        data: { id: this.test.questions[0].id },
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(result => {
          this.phaserGame.scene.game.events.emit('questionAnswered');
      });
    });
  }

  ngOnDestroy(): void {
    this.phaserGame.destroy(true);
  }
}
