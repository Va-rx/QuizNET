import { Component, OnInit } from '@angular/core';
import { Test } from 'src/app/models/test.model';
import { TestService } from 'src/app/services/test/test.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-tests',
  templateUrl: './tests.component.html',
  styleUrls: ['./tests.component.css']
})
export class TestsComponent implements OnInit{
  tests: Test[] = [];

  constructor(private testService: TestService, private router: Router, private translate: TranslateService) { }

  ngOnInit() {
    this.testService.getAllTests().subscribe({
      next: tests => {
        this.tests = tests.map(test => ({
          ...test,
          createdDate: new Date(test.createdDate)
        }));
      },
      error: err => {
        console.error('Error getting tests: ', err)
      }
    });
  }

  createNewTest() {
    let test = new Test();

    this.testService.createTest(test).subscribe({
      next: res_test => {
        test = res_test;
        this.router.navigate([`/tests/`, test.id]);
      },
      error: err => {
        console.log('Error creating test: ', err);
      }
    });
  }

  sortBy(criteria: string) {
    if (criteria === 'nameAsc') {
      this.tests.sort((a, b) => a.name.localeCompare(b.name));
    } else if (criteria === 'nameDesc') {
      this.tests.sort((a, b) => b.name.localeCompare(a.name));
    } else if (criteria === 'dateNewest') {
      this.tests.sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime());
    } else if (criteria === 'dateOldest') {
      this.tests.sort((a, b) => a.createdDate.getTime() - b.createdDate.getTime());
    }
  }
}