import {Component, OnInit} from '@angular/core';
import {UserResultsService} from "../../../services/user-results/user-results.service";

import {ActivatedRoute} from "@angular/router";
import {AnswerHistory, TestHistory} from "../../../models/test-history.model";
import {AuthService} from "../../../services/auth/auth.service";
import {
  UserPersonalityResultsService
} from "../../../services/user-personality-results/user-personality-results.service";
import {PersonalityResults} from "../../../models/user-personality-results";

@Component({
  selector: 'app-test-history-details',
  templateUrl: './test-history-details.component.html',
  styleUrls: ['./test-history-details.component.css']
})
export class TestHistoryDetailsComponent implements OnInit {

  test!: TestHistory;
  testId!: number;
  userId!: number;
  personalityResults!: PersonalityResults;
  constructor(private userResultsService: UserResultsService, private route: ActivatedRoute, private authService: AuthService, private userPersonalityResultsService: UserPersonalityResultsService) {}

  ngOnInit(): void {
   this.testId = this.route.snapshot.params['id'];
   this.userId = this.route.snapshot.params['userId'] ? this.route.snapshot.params['userId'] : this.authService.getUserId();

   this.userResultsService.get(this.testId, this.userId).subscribe(data => {
     this.test = data;
     if(this.test.questions)
      this.test.questions.map(question => {
        question.image_link = this.getImageUrl(question.image_link);
      });
   });

   this.userPersonalityResultsService.getPlayerPersonalityResults(this.testId, this.userId).subscribe((data: PersonalityResults) => {
     this.personalityResults = data;
   })
  }

  calculateQuestionScore(answers: AnswerHistory[]): string{
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
