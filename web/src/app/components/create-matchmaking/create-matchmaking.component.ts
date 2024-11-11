import { Component, OnInit,ElementRef,ViewChild } from '@angular/core';
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
  timerControl = new FormControl(1);
  selectedGame: any;
  isSubmitted = false;// DEBUG: TRUE return to false in PROD env
  @ViewChild('targetSection') targetSection!: ElementRef;


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
    this.scrollToSection();
    this.selectedGame = game;
    console.log(this.selectedGame);
  }

  onSubmit(): void {
    const selectedDate = this.dateControl.value;
    const selectedTime = this.timeControl.value;
    const selectedTest = this.selectedTest;
    const selectedGame = this.selectedGame;
    const timerInMinutes = this.timerControl.value ?? 15;
    const timerInSeconds = timerInMinutes * 60;
    if (selectedTest && selectedGame && selectedDate && selectedTime) {
      const data = {
        test: selectedTest,
        game: selectedGame,
        date: selectedDate,
        time: selectedTime,
        timerInSeconds: timerInSeconds
      };

      console.log('Submitting:', data);
      this.isSubmitted = true;
    } else {
      console.log('Please select all required fields.');
    }
  }

  scrollToSection() {
    this.targetSection?.nativeElement.scrollIntoView({
      behavior: 'smooth'
    });
  }

  get timerInSeconds(): number {
    return (this.timerControl.value ?? 15) * 60;
  }
}
