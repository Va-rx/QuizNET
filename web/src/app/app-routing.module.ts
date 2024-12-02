import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateLobbyComponent } from './components/create-lobby/create-lobby.component';
import { JoinLobbyComponent } from './components/join-lobby/join-lobby.component';
import { GameComponent } from './components/game/game.component';
import { TankGameComponent } from './components/tank-game/tank-game.component';
import { CreateMatchmakingComponent } from './components/create-matchmaking/create-matchmaking.component';
import { TestsComponent } from './components/tests/tests.component';
import {RegisterComponent} from "./components/register/register.component";
import { TestDetailsComponent } from './components/test-details/test-details.component';
import {LoginComponent} from "./components/login/login.component";
import {authGuard} from "./guards/auth.guard";
import {HomeComponent} from "./components/home/home.component";
import {RoleGuard} from "./guards/role.guard";
import { ScoreboardComponent } from './components/scoreboard/scoreboard.component';
import {TestHistoryComponent} from "./components/test-history/test-history.component";
import {
  TestHistoryDetailsComponent
} from "./components/test-history/test-history-details/test-history-details.component";
import {TestHistoryListComponent} from "./components/test-history/test-history-list/test-history-list.component";
import {TestHistoryGuard} from "./guards/test-history.guard";
import {MultiplayerGameComponent} from "./components/multiplayer-game/multiplayer-game.component";
import {MapEditorComponent} from "./components/map-editor/map-editor.component";
const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [authGuard] },
  { path: 'create-lobby', component: CreateLobbyComponent, canActivate: [authGuard, RoleGuard]},
  { path: 'join-lobby', component: JoinLobbyComponent, canActivate: [authGuard]},
  { path: 'game', component: GameComponent, canActivate: [authGuard]},
  { path: 'tank-game', component: TankGameComponent, canActivate: [authGuard]},
  { path :'create-matchmaking', component: CreateMatchmakingComponent, canActivate: [authGuard, RoleGuard]},
  { path: 'tank-game/:id', component: TankGameComponent, canActivate: [authGuard]},
  { path: 'tests', component: TestsComponent, canActivate: [authGuard, RoleGuard]},
  {path: 'final',component:ScoreboardComponent, canActivate: [authGuard]},
  { path: 'register', component: RegisterComponent},
  { path: 'login', component: LoginComponent},
  { path: 'tests/:id', component: TestDetailsComponent, canActivate: [authGuard, RoleGuard]},
  { path: 'test-history', component: TestHistoryComponent, canActivate: [authGuard]},
  { path: 'test-history/:id/:userId', component: TestHistoryDetailsComponent, canActivate: [authGuard, TestHistoryGuard]},
  { path: 'test-history/:id', component: TestHistoryListComponent, canActivate: [authGuard, RoleGuard] },
  { path: 'deathmatch', component: MultiplayerGameComponent, canActivate: [authGuard]},
  { path: 'map-editor', component: MapEditorComponent, canActivate: [authGuard, RoleGuard]}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
