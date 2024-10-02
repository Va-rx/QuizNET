import {Component, OnInit} from '@angular/core';
import {TestHistoryService} from "../../services/test-history/test-history.service";
import {TestHistory} from "../../models/test-history.model";
import {Router} from "@angular/router";
import {AuthService} from "../../services/auth/auth.service";
import {Role} from "../../models/user.model";

@Component({
  selector: 'app-test-history',
  templateUrl: './test-history.component.html',
  styleUrls: ['./test-history.component.css']
})
export class TestHistoryComponent implements OnInit{

  tests: TestHistory[] = [];

  get userRole(): Role {
    return this.authService.user?.role || Role.NONE;
  }

  constructor(private testHistoryService: TestHistoryService,
              private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    if (this.userRole === Role.ADMIN) {
      this.testHistoryService.getAll().subscribe(data => {
        this.tests = data;
      });
    }
    else {
      this.testHistoryService.getTestsConnectedToUser().subscribe(data => {
        this.tests = data;
      });
    }
  }

  navigateByTestId(testId: number) {
    if (this.userRole === Role.ADMIN) {
      this.router.navigate(['/test-history/', testId]);
    }
    else {
      this.router.navigate(['/test-history/', testId, this.authService.getUserId()]);
    }
  }
}
