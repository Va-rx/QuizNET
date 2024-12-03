import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { Difficulty, Level } from 'src/app/models/level.model';
import { GamesService } from 'src/app/services/game/game.service';
import { LevelService } from 'src/app/services/level/level.service';

@Component({
  selector: 'app-map-editor',
  templateUrl: './map-editor.component.html',
  styleUrls: ['./map-editor.component.css']
})
export class MapEditorComponent implements OnInit {
  games!: any;
  Difficulty = Difficulty;
  selectedMap!: File;
  submitted: boolean = false;
  groupedLevels: { [key: string]: Level[] } = {};
  responsiveOptions: any;
  form: any = {
    gameId: null,
    name: null,
    difficulty: null,
    time: null,
    map: null
  };

  constructor(private gamesService: GamesService, private levelService: LevelService, private _snackBar: MatSnackBar, private translateService: TranslateService) {
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
    this.loadLevels();
    this.loadGames();
  }

  onFileSelected(event) {
    this.selectedMap = event.target.files[0];
  }

  loadLevels(): void {
    this.levelService.getAllLevels().subscribe((data: { [key: string]: any[] }) => {
      this.groupedLevels = data;
    });
  }

  loadGames(): void {
    this.gamesService.getAllGames().subscribe((data: any[]) => {
      this.games = data;
  
    });
  }


  async onSubmit() {
    this.submitted = true;
    let text = await this.translate('MAP_EDITOR.LEVEL_CREATED').toPromise();
    let close = await this.translate('GENERAL.CLOSE').toPromise();
    this.levelService.createLevel({gameId: this.form.gameId, name: this.form.name , difficulty: this.form.difficulty, time: this.form.time, map: this.selectedMap}).subscribe((newLevel) => {
      if (newLevel) {
        if (!this.groupedLevels[newLevel.gameId]) {
          this.groupedLevels[newLevel.gameId] = [];
        }
        this.groupedLevels[newLevel.gameId].push(newLevel);
        this.submitted = false;
        this.form = {
          gameId: null,
          name: null,
          difficulty: null,
          time: null,
          map: null
        };
        this._snackBar.open(text ? text: '', close ? close: '');
    
      }
    });
  }

  translate(key: string): Observable<string> {
    return this.translateService.get(key);
  }

  deleteLevel(level: Level) {
    if (level.id) {
      
      this.levelService.deleteLevel(level.id).subscribe((deleted) => {
        console.log(deleted);
        if (deleted) {
          this.groupedLevels[level.gameId] = this.groupedLevels[level.gameId].filter((l) => l.id !== level.id);
        }
      });
    }
  }
}


