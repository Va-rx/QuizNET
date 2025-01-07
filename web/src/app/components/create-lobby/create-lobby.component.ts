import { Component, Input, OnInit } from '@angular/core';
import { SocketServiceService } from 'src/app/services/socket/socket-service.service';
import { Level } from 'src/app/models/level.model';

@Component({
  selector: 'app-create-lobby',
  templateUrl: './create-lobby.component.html',
  styleUrls: ['./create-lobby.component.css'],
})
export class CreateLobbyComponent implements OnInit {
  private socket: any;
  joinCode: string = '';
  userList: string[] = [];

  created: boolean = false;
  lobbyName!: string;
  userName: string = "Creator";
  scheduled: boolean = false;
  timer:number=900;
  @Input() scoreBoard: Map<string, [number, number]> = new Map<string, [number, number]>();


  @Input() test: any;
  @Input() date !: Date | null;
  @Input() time !: Date | null;
  @Input() game: any;
  @Input() timerInput: any;
  @Input() levels!: Level[];

  @Input() bonuses: any;  
  @Input() shuffleQuestions: boolean = false;
  @Input() shuffleAnswers: boolean = false;
  constructor(private socketService: SocketServiceService) { }

  ngOnInit(): void {
    this.socket = this.socketService.getSocket();
    this.socket.on('joinCode', (code: string) => {
      this.joinCode = code;
      this.created = true;
      this.onStartGame();
    });

    this.socket.on('userList', (users: string[]) => {
      this.userList = users.filter(user => user !== "Creator");
    });

    this.socket.on('broadcastScoreBoard', (jsonScoreBoard) => {
      this.scoreBoard = new Map(Object.entries(JSON.parse(jsonScoreBoard)));
    }
    );
  }
  onSubmit(): void {
    this.socketService.setUserId(this.userName);
    this.socket.emit('requestJoinCode', this.userName, this.lobbyName);
  }

  onStartGame(): void {
    this.socket.emit('startGame', this.joinCode,this.date, this.time, this.game, this.test,this.timerInput, this.levels, this.bonuses, this.shuffleQuestions, this.shuffleAnswers);
    this.scheduled = true;
  }
}
