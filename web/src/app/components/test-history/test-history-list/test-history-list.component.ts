import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {UserResultsService} from "../../../services/user-results/user-results.service";
import {Results} from "../../../models/user-results.model";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {TestHistoryService} from "../../../services/test-history/test-history.service";
import {TestHistory} from "../../../models/test-history.model";

@Component({
  selector: 'app-test-history-list',
  templateUrl: './test-history-list.component.html',
  styleUrls: ['./test-history-list.component.css']
})
export class TestHistoryListComponent implements OnInit, AfterViewInit {


  userResults!: MatTableDataSource<Results>;
  userData: any;

  displayedColumns = ['name', 'surname', 'score']
  testId: number = -1;
  test!: TestHistory;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private route: ActivatedRoute, private userResultsService: UserResultsService, private router: Router, private testHistoryService: TestHistoryService) { }

  ngOnInit(): void {
    this.testId =  this.route.snapshot.params['id'];
    this.userResultsService.getAll(this.testId).subscribe(data => {
      this.userResults = new MatTableDataSource(data);
      this.userResults.sort = this.sort;
      this.userData = data;
    });

    this.testHistoryService.get(this.testId).subscribe(data => {
      this.test = data;
    })
  }

  ngAfterViewInit(): void {
    if (this.userResults) {
      this.userResults.sort = this.sort;
    }
  }

  goToDetails(row: Results) {
    this.router.navigate(['/test-history/', this.testId, row.userId]);
  }

  getMaxPoints(question): number {
    return question.answers.reduce((acc, curr) => curr.points > 0 ? acc + curr.points : acc, 0);
  }

  downloadResults() {
    const csvData = this.convertToCSV(this.userData);
    
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${this.test.testName}_results`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  convertToCSV(data: any[]): string {
    if (!data.length) {
      return '';
    }

    const headers = ['Imię', 'Nazwisko', 'Numer ID', 'E-mail', 'Punkty'];
    const csvRows: string[] = [];    

    csvRows.push(headers.join(','));
    
    for (const row of data) {
      const rowValues = headers.map(header => {
        switch (header) {
          case 'Imię':
            return JSON.stringify(row.name);
          case 'Nazwisko':
            return JSON.stringify(row.surname);
          case 'Numer ID':
            return '412121';
          case 'E-mail':
            return 'abc@abc.pl';
          case 'Punkty':
            return JSON.stringify(row.score);
          default:
            return '';
        }
      });
      csvRows.push(rowValues.join(','));
    }
    return csvRows.join('\n');
  }
}
