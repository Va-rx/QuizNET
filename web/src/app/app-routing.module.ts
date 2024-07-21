import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuestionsListComponent } from './components/question-list/question-list.component';
import { QuestionDetailsComponent } from './components/question-details/question-details.component';
import { AddQuestionComponent } from './components/add-question/add-question.component';
import { CreateLobbyComponent } from './components/create-lobby/create-lobby.component';
import { JoinLobbyComponent } from './components/join-lobby/join-lobby.component';
import { GameComponent } from './components/game/game.component';
import { TankGameComponent } from './components/tank-game/tank-game.component';
import { CreateMatchmakingComponent } from './components/create-matchmaking/create-matchmaking.component';
import { CreateTestComponent } from './components/create-test/create-test.component';
import {RegisterComponent} from "./components/register/register.component";
import {LoginComponent} from "./components/login/login.component";
import {authGuard} from "./guards/auth.guard";
import {HomeComponent} from "./components/home/home.component";
import {RoleGuard} from "./guards/role.guard";
import { ScoreboardComponent } from './scoreboard/scoreboard.component';
const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [authGuard] },
  { path: 'Questions', component: QuestionsListComponent, canActivate: [authGuard, RoleGuard]},
  { path: 'Questions/:id', component: QuestionDetailsComponent, canActivate: [authGuard, RoleGuard]},
  { path: 'add', component: AddQuestionComponent, canActivate: [authGuard, RoleGuard]},
  { path: 'create-lobby', component: CreateLobbyComponent, canActivate: [authGuard, RoleGuard]},
  { path: 'join-lobby', component: JoinLobbyComponent, canActivate: [authGuard]},
  { path: 'game', component: GameComponent, canActivate: [authGuard]},
  { path: 'tank-game', component: TankGameComponent, canActivate: [authGuard]},
  { path :'create-matchmaking', component: CreateMatchmakingComponent, canActivate: [authGuard, RoleGuard]},
  { path: 'tank-game/:id', component: TankGameComponent, canActivate: [authGuard]},
  { path: 'create-test', component: CreateTestComponent, canActivate: [authGuard, RoleGuard]},
  {path: 'final',component:ScoreboardComponent, canActivate: [authGuard]},
  { path: 'register', component: RegisterComponent},
  { path: 'login', component: LoginComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
