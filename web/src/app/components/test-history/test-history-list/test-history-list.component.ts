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

  displayedColumns = ['name', 'score']
  testId: number = -1;
  test!: TestHistory;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private route: ActivatedRoute, private userResultsService: UserResultsService, private router: Router, private testHistoryService: TestHistoryService) { }

  ngOnInit(): void {
    this.testId =  this.route.snapshot.params['id'];
    this.userResultsService.getAll(this.testId).subscribe(data => {
      this.userResults = new MatTableDataSource(data);
      this.userResults.sort = this.sort;
    });

    this.testHistoryService.get(this.testId).subscribe(data => {
      this.test = data;
      if(this.test.questions)
      this.test.questions.map(question => {
        question.image_link = this.getImageUrl(question.image_link);
      })
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

  getImageUrl(imageData: any): string {
    if (imageData === '') return '';
    if (imageData && imageData.type === 'Buffer') {
      const blob = new Blob([new Uint8Array(imageData.data)], {type: 'image/jpeg'});
      return URL.createObjectURL(blob);
    }

    if (typeof imageData === 'string') {
      return `data:image/jpeg;base64,${imageData}`;
    } else if (imageData instanceof Blob) {
      return URL.createObjectURL(imageData);
    }
    return '';
  }
}
