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
const routes: Routes = [
  { path: '', redirectTo: 'Questions', pathMatch: 'full' },
  { path: 'Questions', component: QuestionsListComponent },
  { path: 'Questions/:id', component: QuestionDetailsComponent },
  { path: 'add', component: AddQuestionComponent },
  { path: 'create-lobby', component: CreateLobbyComponent },
  { path: 'join-lobby', component: JoinLobbyComponent },
  { path: 'game', component: GameComponent },
  { path: 'tank-game', component: TankGameComponent },
  {path :'create-matchmaking', component: CreateMatchmakingComponent},
  { path: 'tank-game/:id', component: TankGameComponent },
  {path: 'create-test', component: CreateTestComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
