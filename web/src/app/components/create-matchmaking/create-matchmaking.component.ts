import { Component, OnInit,ElementRef,ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GamesService } from 'src/app/services/game/game.service';
import { TestService } from 'src/app/services/test/test.service';
import { Level } from 'src/app/models/level.model';
import { LevelService } from 'src/app/services/level/level.service';

@Component({
  selector: 'app-create-matchmaking',
  templateUrl: './create-matchmaking.component.html',
  styleUrls: ['./create-matchmaking.component.css']
})
export class CreateMatchmakingComponent implements OnInit {
  testSets: any[] = [];
  games: any[] = [];
  groupedLevels: { [key: string]: Level[] } = {};
  selectedTest: any;
  dateControl = new FormControl(new Date());
  timeControl = new FormControl(new Date());
  timerControl = new FormControl(1);
  selectedGame: any;
  selectedLevels: Level[] = [];
  isSubmitted = false;// DEBUG: TRUE return to false in PROD env
  @ViewChild('targetSection') targetSection!: ElementRef;
  responsiveOptions;
  chosenTestNumberOfQuestion: number = 0;
  shuffleQuestions: boolean = false;
  shuffleAnswers: boolean = false;
  platformerLevelNoDeathBonus: FormControl = new FormControl(5);
  platformerBonusFruitsBonus: FormControl = new FormControl(5);
  platformerLevelSpeedBonus: FormControl = new FormControl(5);

  bonuses: { [key: string]: number } = {};

  constructor(private testsService: TestService,private gameService: GamesService, private levelService: LevelService) {
    this.responsiveOptions = [
      {
        breakpoint: '1024px',
        numVisible: 1,
        numScroll: 1,
      },
      {
        breakpoint: '768px',
        numVisible: 1,
        numScroll: 1,
      },
      {
        breakpoint: '560px',
        numVisible: 1,
        numScroll: 1,
      },
    ];
   }

  ngOnInit(): void {
    this.loadTestSets();
    this.loadGames();
    this.loadLevels();
  }

  loadTestSets(): void {
    this.testsService.getAllTests().subscribe((data: any[]) => {
      this.testSets = data;
    });
  }

  loadGames(): void {
    this.gameService.getAllGames().subscribe((data: any[]) => {
      this.games = data;
    });
  }

  loadLevels(): void {
    this.levelService.getAllLevels().subscribe((data: { [key: string]: any[] }) => {
      this.groupedLevels = data;
    });
  }

  selectTest(test: any): void {
    this.selectedTest = test;
    this.testsService.getTestDetails(this.selectedTest.id).subscribe((data) => {
      this.chosenTestNumberOfQuestion = data.questions.length;
    })
  }

  selectGame(game: any): void {
    this.scrollToSection();
    this.selectedGame = game;
    this.selectedLevels = [];
  }

  selectLevel(level: Level): void {
    if (this.selectedLevels && this.isLevelSelected(level)) {
      this.selectedLevels = this.selectedLevels.filter(lvl => lvl.id !== level.id);
    } else {
      this.selectedLevels?.push(level);
    }
  }


  onSubmit(): void {
    const selectedDate = this.dateControl.value;
    const selectedTime = this.timeControl.value;
    const selectedTest = this.selectedTest;
    const selectedGame = this.selectedGame;
    const timerInMinutes = this.timerControl.value ?? 15;
    const timerInSeconds = timerInMinutes * 60;
    const selectedLevels = this.selectedLevels;
    if (selectedTest && selectedGame && selectedDate && selectedTime && this.selectedLevels.length > 0) {
      if ((selectedGame.name === 'Czołgi' || selectedGame.name === 'Deathmatch') && this.selectedLevels.length !== 1) {
        alert('Wybrana gra może mieć tylko jedną mapę!');
        return;
      } else if (selectedGame.name === 'Platformer' && this.selectedLevels.length !== this.chosenTestNumberOfQuestion) {
        alert('Wybrana gra powinna mieć tyle map ile ma pytań!');
        return;
      }


      const data = {
        test: selectedTest,
        game: selectedGame,
        date: selectedDate,
        time: selectedTime,
        timerInSeconds: timerInSeconds,
        level: selectedLevels
      };

      this.bonuses = {};
      if (selectedGame.name === 'Platformer') {
        this.bonuses = {
          'PLATFORMER.NO_DEATH_LEVEL_BONUS': this.platformerLevelNoDeathBonus.value / 100,
          'PLATFORMER.BONUS_FRUITS_BONUS': this.platformerBonusFruitsBonus.value / 100,
          'PLATFORMER.LEVEL_SPEED_BONUS': this.platformerLevelSpeedBonus.value / 100,
        }
      }

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

  isLevelSelected(level: Level) {
    if (this.selectedLevels && this.selectedLevels.some(lvl => lvl.id === level.id )) return true;
    return false;
  }
}
