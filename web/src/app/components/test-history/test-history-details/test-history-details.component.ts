import {Component, OnInit} from '@angular/core';
import {UserResultsService} from "../../../services/user-results/user-results.service";

import {ActivatedRoute} from "@angular/router";
import {TestHistory} from "../../../models/test-history.model";
import {AuthService} from "../../../services/auth/auth.service";

@Component({
  selector: 'app-test-history-details',
  templateUrl: './test-history-details.component.html',
  styleUrls: ['./test-history-details.component.css']
})
export class TestHistoryDetailsComponent implements OnInit {

  test!: TestHistory;
  testId!: number;
  userId!: number;
  constructor(private userResultsService: UserResultsService, private route: ActivatedRoute, private authService: AuthService) {}

  ngOnInit(): void {
   this.testId = this.route.snapshot.params['id'];
   this.userId = this.route.snapshot.params['userId'] ? this.route.snapshot.params['userId'] : this.authService.getUserId();

   this.userResultsService.get(this.testId, this.userId).subscribe(data => {
     this.test = data;
   });
  }

  calculateQuestionScore(answers): string{
    let score = 0;
    let maxScore = 0;
    answers.forEach(answer => {
      if (answer.isCorrect){
        maxScore += answer.points;
      }
      if (answer.selected){
        score += answer.points;
      }
    });

    return `${Math.max(score, 0)}/${maxScore}`;
  }
}
