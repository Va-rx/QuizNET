import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuestionsListComponent } from './components/question-list/question-list.component';
import { QuestionDetailsComponent } from './components/question-details/question-details.component';
import { AddQuestionComponent } from './components/add-question/add-question.component';
import { CreateLobbyComponent } from './components/create-lobby/create-lobby.component';
import { JoinLobbyComponent } from './components/join-lobby/join-lobby.component';
import { GameComponent } from './components/game/game.component';
const routes: Routes = [
  { path: '', redirectTo: 'Questions', pathMatch: 'full' },
  { path: 'Questions', component: QuestionsListComponent },
  { path: 'Questions/:id', component: QuestionDetailsComponent },
  { path: 'add', component: AddQuestionComponent },
  { path: 'create-lobby', component: CreateLobbyComponent },
  { path: 'join-lobby', component: JoinLobbyComponent },
  { path: 'game', component: GameComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
