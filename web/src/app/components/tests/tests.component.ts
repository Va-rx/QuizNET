import { Component, OnInit } from '@angular/core';
import {Observable, of} from 'rxjs';
import { Test } from 'src/app/models/test.model';
import { TestService } from 'src/app/services/test/test.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-tests',
  templateUrl: './tests.component.html',
  styleUrls: ['./tests.component.css']
})
export class TestsComponent implements OnInit{
  tests$: Observable<Test[]> = of();
  test: Test = new Test();

  constructor(private testService: TestService) { }

  ngOnInit() {
    this.tests$ = this.testService.getAll();
  }

  onTestClick(test: Test) {
    this.testService.selectTest(test);
  }

  createNewTest() {    
    let newTest = new Test();
    this.calculateNewTestSufix().subscribe(sufix => {
      newTest.name = "New test" + sufix;
      newTest.description = "";
      this.testService.create(newTest).subscribe();
      this.tests$ = this.testService.getAll();
    })
  }

  
  //  Function that returns a sufix number for the "New test" string. If there is not any test with name: "New test{number}" it returns 1, otherwise it returns the max+1
  private calculateNewTestSufix() {
    return this.tests$.pipe(
      map(testsArray => {
        const regex = /^New test(\d+)$/;

        const maxNumber = testsArray.reduce((max, test) => {
          const match = test.name.match(regex);
          if (match) {
            const number = parseInt(match[1], 10);
            return Math.max(max, number);
          }
          return max;
        }, -Infinity);

        if (maxNumber === -Infinity) {
          return "1";
        } else {
          return (maxNumber +1).toString();
        }
      })
    )
  }
}
