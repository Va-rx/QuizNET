import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AddQuestionComponent } from './components/add-question/add-question.component';
import { QuestionDetailsComponent } from './components/question-details/question-details.component';
import { QuestionsListComponent } from './components/question-list/question-list.component';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CreateLobbyComponent } from './components/create-lobby/create-lobby.component';
import { JoinLobbyComponent } from './components/join-lobby/join-lobby.component';
import { GameComponent } from './components/game/game.component';
import { TankGameComponent } from './components/tank-game/tank-game.component';
import { SocketServiceService } from './services/socket/socket-service.service';
import { QuestionViewComponent } from './components/question-view/question-view.component';
import {MatButtonModule} from '@angular/material/button';
import { AnswerViewComponent } from './components/question-view/answer-view/answer-view.component';
import { MatDialogModule } from '@angular/material/dialog';
import {MatCardModule} from "@angular/material/card";
import {MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import { CreateMatchmakingComponent } from './components/create-matchmaking/create-matchmaking.component';
import { TestsComponent } from './components/tests/tests.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { NavbarComponent } from './navbar/navbar.component';

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
    AnswerViewComponent,
    CreateMatchmakingComponent,
    TestsComponent,
    RegisterComponent,
    LoginComponent,
    HomeComponent,
    NavbarComponent,
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        HttpClientModule,
        MatButtonModule,
        MatDialogModule,
        MatCardModule,
        MatInputModule,
        MatIconModule,
        MatCheckboxModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSnackBarModule
    ],
  providers: [SocketServiceService],
  bootstrap: [AppComponent]
})
export class AppModule { }
