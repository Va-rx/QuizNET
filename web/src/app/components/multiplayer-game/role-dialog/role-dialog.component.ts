import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {SocketServiceService} from "../../../services/socket/socket-service.service";
import {MultiplayerRoles} from "./role.model";

@Component({
  selector: 'app-role-dialog',
  templateUrl: './role-dialog.component.html',
  styleUrls: ['./role-dialog.component.css']
})
export class RoleDialogComponent implements OnInit{


  private socket: any;
  chosenRole: MultiplayerRoles = MultiplayerRoles.NONE;
  timeLeft!: number;
  MultiplayerRoles = MultiplayerRoles;
  constructor(private socketService: SocketServiceService, @Inject(MAT_DIALOG_DATA) public data: {roles: string[]}, private dialogRef: MatDialogRef<RoleDialogComponent>) {
  }

  ngOnInit(): void {
    this.socket = this.socketService.getSocket();
    this.socket.emit('start_multiplayer')
    this.socket.on('countdownUpdate', (timeLeft: number) => {
      this.timeLeft = timeLeft;
    });

    this.socket.on('countdownEnd', () => {
      this.submitRole();

    });
  }

  choose(role: MultiplayerRoles): void {
    console.log(role);
    this.chosenRole = role;
  }

  generateRandomRole(): void {
    if (!this.chosenRole) {
      this.chosenRole = MultiplayerRoles.OFFENSIVE;
    }
  }

  submitRole(): void {
    if (this.chosenRole == MultiplayerRoles.NONE) {
      this.chosenRole = MultiplayerRoles.OFFENSIVE;
    }

    this.socket.emit('roleChosen', this.chosenRole, this.socket.id);
    this.dialogRef.close(this.chosenRole);
  }
}
