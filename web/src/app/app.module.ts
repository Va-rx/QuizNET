import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AddQuestionComponent } from './components/add-question/add-question.component';
import { QuestionDetailsComponent } from './components/question-details/question-details.component';
import { QuestionsListComponent } from './components/question-list/question-list.component';

import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CreateLobbyComponent } from './components/create-lobby/create-lobby.component';
import { JoinLobbyComponent } from './components/join-lobby/join-lobby.component';
import { GameComponent } from './components/game/game.component';
import { TankGameComponent } from './components/tank-game/tank-game.component';
import { SocketServiceService } from './services/socket-service.service';
import { QuestionViewComponent } from './components/question-view/question-view.component';
import {MatButtonModule} from '@angular/material/button';
import { AnswerViewComponent } from './components/question-view/answer-view/answer-view.component';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
    AppComponent,
    AddQuestionComponent,
    QuestionDetailsComponent,
    QuestionsListComponent,
    CreateLobbyComponent,
    JoinLobbyComponent,
    GameComponent,
    TankGameComponent,
    QuestionViewComponent,
    AnswerViewComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    MatButtonModule,
    MatDialogModule
  ],
  providers: [SocketServiceService],
  bootstrap: [AppComponent]
})
export class AppModule { }
