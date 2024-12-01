import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClient, HttpClientModule} from '@angular/common/http';
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
import { NavbarComponent } from './components/navbar/navbar.component';
import { TestDetailsComponent } from './components/test-details/test-details.component';
import { ScoreboardComponent } from './components/scoreboard/scoreboard.component';
import { TestHistoryComponent } from './components/test-history/test-history.component';
import { TestHistoryDetailsComponent } from './components/test-history/test-history-details/test-history-details.component';
import {MatListModule} from "@angular/material/list";
import { TestHistoryListComponent } from './components/test-history/test-history-list/test-history-list.component';
import {MatTableModule} from "@angular/material/table";
import {MatSortModule} from "@angular/material/sort";
import { TimerComponent } from './components/timer/timer.component';
import { PlatformGameComponent } from './components/platform-game/platform-game.component';
import { LiveScoreBoardComponent } from './components/live-score-board/live-score-board.component';
import { MultiplayerGameComponent } from './components/multiplayer-game/multiplayer-game.component';
import { RoleDialogComponent } from './components/multiplayer-game/role-dialog/role-dialog.component';
import { ShareHealthComponent } from './components/multiplayer-game/share-health/share-health.component';
import {MatTabsModule} from "@angular/material/tabs";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {TranslateHttpLoader} from "@ngx-translate/http-loader";

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
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
    TestDetailsComponent,
    ScoreboardComponent,
    TestHistoryComponent,
    TestHistoryDetailsComponent,
    TimerComponent,
    TestHistoryListComponent,
    PlatformGameComponent,
    LiveScoreBoardComponent,
    MultiplayerGameComponent,
    RoleDialogComponent,
    ShareHealthComponent,
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
        MatSnackBarModule,
        MatListModule,
        MatTableModule,
        MatSortModule,
        MatTabsModule,
        TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      })
    ],
  providers: [SocketServiceService],
  bootstrap: [AppComponent]
})
export class AppModule { }
