import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { Difficulty, Level } from 'src/app/models/level.model';
import { GamesService } from 'src/app/services/game/game.service';
import { LevelService } from 'src/app/services/level/level.service';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

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

  colors:Array<String>=["Blue","Camo","Desert","Purple","Red"]

  filesStructure = [
    ...this.colors.map(color => ({
      folder: 'tanks',
      name: `${color}/towers_walls_blank.png`,
      path: `assets/games/tankgame/${color}/Towers/towers_walls_blank.png`
    })),
    { folder: 'tanks', name: 'terrain.png', path: 'assets/games/tankgame/Terrains/terrain.png' },
    { folder: 'tanks', name: 'ammo.png', path: 'assets/games/tankgame/ammo.png' },
    { folder: 'tanks', name: 'health.png', path: 'assets/games/tankgame/health.png' },
    { folder: 'tanks', name: 'Poradnik.pdf', path: 'assets/games/tankgame/Poradnik.pdf' },
    { folder: 'tanks', name: 'star.png', path: 'assets/games/tankgame/star.png' },
    { folder: 'tanks', name: 'bomb.png', path: 'assets/games/tankgame/bomb.png' },

    { folder: 'deathmatch', name: 'fences.png', path: 'assets/games/multiplayergame/Map/fences.png' },
    { folder: 'deathmatch', name: 'grass.png', path: 'assets/games/multiplayergame/Map/grass.png' },
    { folder: 'deathmatch', name: 'plains.png', path: 'assets/games/multiplayergame/Map/plains.png' },
    { folder: 'deathmatch', name: 'player.png', path: 'assets/games/multiplayergame/Player/player.png' },
    { folder: 'deathmatch', name: 'star.png', path: 'assets/games/tankgame/star.png' },

    { folder: 'platformer', name: 'Terrain.png', path: 'assets/games/platformer/tilesets/Terrain.png' },
    { folder: 'platformer', name: 'Spikes.png', path: 'assets/games/platformer/tilesets/Spikes.png' },
    { folder: 'platformer', name: 'Platform.png', path: 'assets/games/platformer/tilesets/platforms/Off.png' },
    { folder: 'platformer', name: 'Saw.png', path: 'assets/games/platformer/tilesets//Off.png' },
    //PDF DO PLATFORMERA,
  ];

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

  async downloadAssets() {
    const zip = new JSZip();

    for (const file of this.filesStructure) {
      const response = await fetch(file.path);
      const blob = await response.blob();
      zip.folder(file.folder)?.file(file.name, blob);
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, 'quiznetGameAssets.zip');
  }
}


