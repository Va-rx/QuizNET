import {Component, OnInit} from '@angular/core';
import {UserResultsService} from "../../../services/user-results/user-results.service";

import {ActivatedRoute} from "@angular/router";
import {TestHistory} from "../../../models/test-history.model";

@Component({
  selector: 'app-test-history-details',
  templateUrl: './test-history-details.component.html',
  styleUrls: ['./test-history-details.component.css']
})
export class TestHistoryDetailsComponent implements OnInit {

  test!: TestHistory;
  testId!: number;
  constructor(private userResultsService: UserResultsService, private route: ActivatedRoute ) {}

  ngOnInit(): void {
   this.testId = this.route.snapshot.params['id'];
   this.userResultsService.get(this.testId).subscribe(data => {
     this.test = data;
   });
  }
}
