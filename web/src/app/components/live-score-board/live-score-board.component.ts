import { Component, ViewChild, AfterViewInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

interface LiveResults {
  name: string;
  score: number;
}

@Component({
  selector: 'app-live-score-board',
  templateUrl: './live-score-board.component.html',
  styleUrls: ['./live-score-board.component.css']
})
export class LiveScoreBoardComponent implements AfterViewInit, OnChanges {

  @Input() scoreboard: Map<string, number> = new Map<string, number>();

  displayedColumns: string[] = ['name', 'score'];
  userResults = new MatTableDataSource<LiveResults>([]);
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {}

  ngAfterViewInit() {
    this.userResults.sort = this.sort;
    this.applyDataToTable();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['scoreboard']) {
      this.applyDataToTable();
    }
  }

  private applyDataToTable() {
    this.userResults.data = Array.from(this.scoreboard, ([name, score]) => ({ name, score }));

    if (this.sort) {
      setTimeout(() => {
      // Set the initial sort to 'score' column in descending order
      this.sort.active = 'score';
      this.sort.direction = 'desc';
      this.sort.sortChange.emit(); // Trigger data sorting
      });
    }
  }
}
