import { Component,OnInit } from '@angular/core';
import io from 'socket.io-client';

@Component({
  selector: 'app-create-lobby',
  templateUrl: './create-lobby.component.html',
  styleUrls: ['./create-lobby.component.css']
})
export class CreateLobbyComponent implements OnInit {
  private socket: any;
  joinCode: string = '';
  userList: string[] = [];
  created: boolean = false;
  constructor() { }

  ngOnInit(): void {
    // Connect to Socket.io server
    this.socket = io('http://localhost:8080'); // Adjust URL accordingly

    this.socket.on('joinCode', (code: string) => {
      console.log('Received join code:', code);
      this.joinCode = code;
      this.created = true;
    });

    this.socket.on('userList', (users: string[]) => {
      this.userList = users;
    });
  }

  // Method to handle form submission
  onSubmit(): void {
    // Emit an event to the server
    this.socket.emit('requestJoinCode',);

  }

  onStartGame(): void {
    this.socket.emit('startGame');
  }
}
