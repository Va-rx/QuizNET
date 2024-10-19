import { Component, ViewChild, AfterViewInit } from '@angular/core';
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
export class LiveScoreBoardComponent implements AfterViewInit {

  displayedColumns: string[] = ['name', 'score'];
  userResults = new MatTableDataSource<LiveResults>([]);
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    const sampleData: LiveResults[] = [
      { name: 'Alice Johnson', score: 88 },
      { name: 'Bob Smith', score: 74 },
      { name: 'Charlie Brown', score: 91 },
      { name: 'Diana Ross', score: 67 },
      { name: 'Eve Adams', score: 95 },
      { name: 'Frank Miller', score: 82 },
      { name: 'Grace Lee', score: 76 },
      { name: 'Henry Ford', score: 85 },
      { name: 'Ivy Walker', score: 93 },
      { name: 'Jack Turner', score: 68 },
      { name: 'Kathy Wilson', score: 87 },
      { name: 'Liam Harris', score: 72 },
      { name: 'Megan Clark', score: 80 },
      { name: 'Nina Wright', score: 78 },
      { name: 'Oscar King', score: 94 },
      { name: 'Paula Green', score: 70 },
      { name: 'Quincy Allen', score: 83 },
      { name: 'Rachel Carter', score: 89 },
      { name: 'Steve Phillips', score: 65 },
      { name: 'Tina Baker', score: 90 }
    ];

    this.userResults.data = sampleData;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.userResults.sort = this.sort; // Assign the MatSort to the data source

      // Set the initial sort to 'score' column in descending order
      this.sort.active = 'score';
      this.sort.direction = 'desc';
      this.sort.sortChange.emit(); // Emit sort change to trigger data sorting
    });
  }
}
