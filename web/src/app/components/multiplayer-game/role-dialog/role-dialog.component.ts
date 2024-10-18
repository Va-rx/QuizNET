import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {SocketServiceService} from "../../../services/socket/socket-service.service";

@Component({
  selector: 'app-role-dialog',
  templateUrl: './role-dialog.component.html',
  styleUrls: ['./role-dialog.component.css']
})
export class RoleDialogComponent implements OnInit{

  private socket: any;
  chosenRole!: string;
  timeLeft!: number;
  constructor(private socketService: SocketServiceService, @Inject(MAT_DIALOG_DATA) public data: {roles: string[]}, private dialogRef: MatDialogRef<RoleDialogComponent>) {
  }

  ngOnInit(): void {
    this.socket = this.socketService.getSocket();
    this.socket.emit('start_multiplayer')
    this.socket.on('countdownUpdate', (timeLeft: number) => {
      this.timeLeft = timeLeft;
    });

    this.socket.on('countdownEnd', () => {
      this.generateRandomRole();
      this.dialogRef.close(this.chosenRole);
    });
  }

  choose(role: string): void {
    this.socket.emit('roleChosen', role);
    this.chosenRole = role;
  }

  generateRandomRole(): void {
    if (!this.chosenRole) {
      this.chosenRole = this.data.roles[Math.floor(Math.random() * this.data.roles.length)];
      this.socket.emit('roleChosen', this.chosenRole);
    }
  }


}
