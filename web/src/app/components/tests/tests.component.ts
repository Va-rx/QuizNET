import { Component, OnInit } from '@angular/core';
import { Test } from 'src/app/models/test.model';
import { TestService } from 'src/app/services/test/test.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tests',
  templateUrl: './tests.component.html',
  styleUrls: ['./tests.component.css']
})
export class TestsComponent implements OnInit{
  tests: Test[] = [];

  constructor(private testService: TestService, private router: Router) { }

  ngOnInit() {
    this.testService.getAllTests().subscribe({
      next: tests => {
        this.tests = tests;
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
}
