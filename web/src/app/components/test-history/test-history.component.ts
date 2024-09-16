import {Component, OnInit} from '@angular/core';
import {TestHistoryService} from "../../services/test-history/test-history.service";
import {Test} from "../../models/test.model";
import * as test from "node:test";
import {TestHistory} from "../../models/test-history.model";
import {Router} from "@angular/router";

@Component({
  selector: 'app-test-history',
  templateUrl: './test-history.component.html',
  styleUrls: ['./test-history.component.css']
})
export class TestHistoryComponent implements OnInit{


  tests: TestHistory[] = [];

  constructor(private testHistoryService: TestHistoryService,
              private router: Router) { }

  ngOnInit(): void {
    this.testHistoryService.getTestsConnectedToUser().subscribe(data => {
      this.tests = data;
    });
  }

  navigateByTestId(testId: number) {
    this.router.navigate(['/test-history/', testId]);
  }
}
