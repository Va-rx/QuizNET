import { Component,OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SocketServiceService } from 'src/app/services/socket/socket-service.service';
import { AuthService } from 'src/app/services/auth/auth.service';
@Component({
  selector: 'app-join-lobby',
  templateUrl: './join-lobby.component.html',
  styleUrls: ['./join-lobby.component.css']
})
export class JoinLobbyComponent implements OnInit {
  private socket: any;
  joinCode: string = '';
  userList: string[] = [];
  joined: boolean = false;
  scheduled :boolean = false;
  startgame_str: string='';
  test_name:string='';
  game_name:string='';
  bonusesEntries:any;
  test_desc:string='';
  constructor(private router: Router,private socketService:SocketServiceService,private auth:AuthService) { }

  ngOnInit(): void {
    this.socket=this.socketService.getSocket();

    this.socket.on('userList', (users: string[]) => {
      this.userList = users.filter(user => user !== "Creator");
      this.joined = true;
    });

    this.socket.on('receive_Data',(startdate:string,test_name:string,test_desc:string,game_name:string, bonuses:any)=>{
        this.scheduled=true;
        this.startgame_str=startdate;
        this.test_name=test_name;
        this.test_desc=test_desc;
        this.game_name=game_name;
        this.bonusesEntries = Object.entries(bonuses);
    })

    this.socket.on('gameStarted', (game_route,test, testHistoryId,timer, players, maxQuestions, levelsData, bonuses, shuffleQuestions, shuffleAnswers) => {
      const data = {
        testId: test.id,
        testHistoryId: testHistoryId,
        timer: timer,
        multiplayerPlayers: players,
        maxQuestions: maxQuestions,
        levelsData: levelsData,
        bonuses: bonuses,
        shuffleQuestions: shuffleQuestions,
        shuffleAnswers: shuffleAnswers
      };
      this.router.navigate([game_route.route],{state:{data}});
    });
  }

  onSubmit(): void {
    this.socket.emit('joinByCode', this.joinCode,this.auth.getNickname());
    this.socketService.setUserId(this.auth.getNickname());
    this.socketService.setJoinCode(this.joinCode);
    localStorage.setItem('joinCode', this.joinCode);
  }
}
