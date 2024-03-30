import { Component,OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import io from 'socket.io-client';

@Component({
  selector: 'app-join-lobby',
  templateUrl: './join-lobby.component.html',
  styleUrls: ['./join-lobby.component.css']
})
export class JoinLobbyComponent {
  private socket: any;
  //form model create
  joinCode: string = '';
  userList: string[] = [];
  joined: boolean = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    //const joinCode = localStorage.getItem('joinCode'); //podtrzymywanie sesji, jak ktoś odświeży do z autmoatu łaczy się po starym kodzie
   // if (joinCode !== null && joinCode !== '' && joinCode !== undefined ) {
      // Reconnect to the same socket using the stored join code
   //   console.log('Reconnecting to lobby with code: ' + joinCode);
    //  this.socket = io('http://localhost:8080');
    //  this.socket.emit('joinByCode', joinCode);
    //  this.joined = true;
    //} else {
      // Connect to Socket.io server
      this.socket = io('http://localhost:8080');
    //}

    this.socket.on('userList', (users: string[]) => {
      this.userList = users;
      this.joined = true;
    });

    this.socket.on('gameStarted', (code: string) => {
      //router to game
      this.router.navigate(['/game']);
    });
  }




  onSubmit(): void {
    // Emit an event to the server
    console.log('Joining lobby with code: ' + this.joinCode);
    this.socket.emit('joinByCode', this.joinCode);
    localStorage.setItem('joinCode', this.joinCode);

  }
}
