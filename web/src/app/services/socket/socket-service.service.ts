import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketServiceService {
  private socket:Socket;
  private userId!:String;
  private joinCode!:String;

  constructor() {
    this.socket=io();
   }

   getSocket():Socket{
    return this.socket;
   }

   setUserId(userId:String):void{
    this.userId=userId;
   }

   getUserId():String{
    return this.userId;
   }

   setJoinCode(joinCode:String):void{
    this.joinCode=joinCode;
   }

   getJoinCode():String{
    return this.joinCode;
   }


}
