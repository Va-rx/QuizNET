import { Component,OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import io, { Socket } from 'socket.io-client';
import { SocketServiceService } from 'src/app/services/socket/socket-service.service';
import { AuthService } from 'src/app/services/auth/auth.service';
@Component({
  selector: 'app-join-lobby',
  templateUrl: './join-lobby.component.html',
  styleUrls: ['./join-lobby.component.css']
})
export class JoinLobbyComponent {
  private socket: any;
  joinCode: string = '';
  userList: string[] = [];
  joined: boolean = false;
  scheduled :boolean = false;
  startgame_str: string='';
  test_name:string='';
  game_name:string='';
  test_desc:string='';
  constructor(private router: Router,private socketService:SocketServiceService,private auth:AuthService) { }

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
      //this.socket = io('http://localhost:8080');
      this.socket=this.socketService.getSocket();
    //}

    this.socket.on('userList', (users: string[]) => {
      this.userList = users.filter(user => user !== "Creator");
      this.joined = true;
    });

    this.socket.on('receive_Data',(startdate:string,test_name:string,test_desc:string,game_name:string)=>{
        this.scheduled=true;
        this.startgame_str=startdate;
        this.test_name=test_name;
        this.test_desc=test_desc;
        this.game_name=game_name;
    })

    this.socket.on('gameStarted', (game_route,test, testHistoryId,timer, players, maxQuestions, levelsData) => {
      //router to game
      console.log(game_route);
      console.log('Game started'+game_route+test.id);
      const data = {
        testId: test.id,
        testHistoryId: testHistoryId,
        timer: timer,
        multiplayerPlayers: players,
        maxQuestions: maxQuestions,
        levelsData: levelsData
      };
      this.router.navigate([game_route.route],{state:{data}});//test.id
    });
  }




  onSubmit(): void {
    // Emit an event to the server
    console.log('Joining lobby with code: ' + this.joinCode);
    this.socket.emit('joinByCode', this.joinCode,this.auth.getNickname());
    this.socketService.setUserId(this.auth.getNickname());
    this.socketService.setJoinCode(this.joinCode);
    localStorage.setItem('joinCode', this.joinCode);

  }
}
