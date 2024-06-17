import {Component, Inject, Input, OnInit, Optional} from '@angular/core';
import { QuestionService } from 'src/app/services/question/question.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Question } from 'src/app/models/question.model';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

@Component({
  selector: 'app-question-details',
  templateUrl: './question-details.component.html',
  styleUrls: ['./question-details.component.css']
})
export class QuestionDetailsComponent implements OnInit {

  @Input() viewMode = false;

  @Input() currentQuestion!: Question;

  message = '';
  file!: File;
  selectedImage: any;
  constructor(
    private questionService: QuestionService,
    private route: ActivatedRoute,
    private router: Router,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    if (!this.viewMode) {
      this.message = '';
    }
    if (this.data) {
      this.currentQuestion = this.data.currentQuestion;
    }
  }
  async updateQuestion(): Promise<void> {
    this.message = '';
    await this.questionService.update(this.currentQuestion.id, this.currentQuestion).toPromise();
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
    this.currentQuestion.answers?.push({ answer: '', isCorrect: false, questionId: this.currentQuestion.id });
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.file = event.target.files[0];
      this.currentQuestion.image_link = this.file;

      const reader = new FileReader();
      reader.onload = e => this.selectedImage = reader.result;

      reader.readAsDataURL(this.file);
    }
  }
  imageSrc(questionSrc: String | File): string {
    if (typeof questionSrc == "string") {
      return `data:image/png;base64,${questionSrc}`;
    }
    return '';
  }
}
