import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {UserResultsService} from "../../../services/user-results/user-results.service";
import {Results} from "../../../models/user-results.model";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";

@Component({
  selector: 'app-test-history-list',
  templateUrl: './test-history-list.component.html',
  styleUrls: ['./test-history-list.component.css']
})
export class TestHistoryListComponent implements OnInit, AfterViewInit {


  userResults!: MatTableDataSource<Results>;

  displayedColumns = ['name', 'score']
  testId: number = -1;

  @ViewChild(MatSort) sort!: MatSort;

  constructor(private route: ActivatedRoute, private userResultsService: UserResultsService, private router: Router) { }

  ngOnInit(): void {
    this.testId =  this.route.snapshot.params['id'];
    this.userResultsService.getAll(this.testId).subscribe(data => {
      this.userResults = new MatTableDataSource(data);
      this.userResults.sort = this.sort;
    });
  }

  ngAfterViewInit(): void {
    if (this.userResults) {
      this.userResults.sort = this.sort;
    }
  }

  goToDetails(row: Results) {
    this.router.navigate(['/test-history/', this.testId, row.userId]);
  }
}
