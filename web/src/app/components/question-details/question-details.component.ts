import { Component, Input, OnInit } from '@angular/core';
import { QuestionService } from 'src/app/services/question/question.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Question } from 'src/app/models/question.model';

@Component({
  selector: 'app-question-details',
  templateUrl: './question-details.component.html',
  styleUrls: ['./question-details.component.css']
})
export class QuestionDetailsComponent implements OnInit {

  @Input() viewMode = false;

  @Input() currentQuestion!: Question;

  message = '';

  constructor(
    private questionService: QuestionService,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit(): void {
    if (!this.viewMode) {
      this.message = '';
    }
  }
  updateQuestion(): void {
    this.message = '';
    this.questionService.update(this.currentQuestion.id, this.currentQuestion)
      .subscribe({
        next: (res) => {
          console.log(res);
          this.message = res.message ? res.message : 'This question was updated successfully!';
        },
        error: (e) => console.error(e)
      });
  }

  deleteQuestion(): void {
    this.questionService.delete(this.currentQuestion.id)
      .subscribe({
        next: (res) => {
          console.log(res);
          this.router.navigate(['/Questions']);
        },
        error: (e) => console.error(e)
      });
  }

  addAnswer(): void {
    this.currentQuestion.answers?.push({answer: ''});
  }

}
