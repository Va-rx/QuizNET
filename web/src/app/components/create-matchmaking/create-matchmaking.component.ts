import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GamesService } from 'src/app/services/game/game.service';
import { TestService } from 'src/app/services/test/test.service';
@Component({
  selector: 'app-create-matchmaking',
  templateUrl: './create-matchmaking.component.html',
  styleUrls: ['./create-matchmaking.component.css']
})
export class CreateMatchmakingComponent implements OnInit {
  testSets: any[] = [];
  games: any[] = [];
  selectedTest: any;
  dateControl = new FormControl(new Date());
  timeControl = new FormControl(new Date());
  selectedGame: any;
  isSubmitted = false;


  constructor(private testsService: TestService,private gameService: GamesService) { }

  ngOnInit(): void {
    this.loadTestSets();
    this.loadGames();
  }

  loadTestSets(): void {
    this.testsService.getAllTests().subscribe((data: any[]) => {
      this.testSets = data;
    });
  }

  loadGames(): void {
    this.gameService.get().subscribe((data: any[]) => {
      this.games = data;
    });
  }

  selectTest(test: any): void {
    this.selectedTest = test;
    console.log(this.selectedTest);
  }

  selectGame(game: any): void {
    this.selectedGame = game;
    console.log(this.selectedGame);
  }

  onSubmit(): void {
    const selectedDate = this.dateControl.value;
    const selectedTime = this.timeControl.value;
    const selectedTest = this.selectedTest;
    const selectedGame = this.selectedGame;

    if (selectedTest && selectedGame && selectedDate && selectedTime) {
      const data = {
        test: selectedTest,
        game: selectedGame,
        date: selectedDate,
        time: selectedTime
      };

      console.log('Submitting:', data);
      this.isSubmitted = true;
    } else {
      console.log('Please select all required fields.');
    }
  }
}