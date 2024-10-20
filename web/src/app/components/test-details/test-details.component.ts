import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TestService } from 'src/app/services/test/test.service';
import { Test} from 'src/app/models/test.model';
import { Question } from 'src/app/models/question.model';
import { Answer } from 'src/app/models/question.model';
import { ViewChild, ElementRef } from '@angular/core';
import { QuestionService } from 'src/app/services/question/question.service';
import { ActivatedRoute } from '@angular/router';
import { AnswerService } from 'src/app/services/answer/answer.service';

@Component({
  selector: 'app-test-details',
  templateUrl: './test-details.component.html',
  styleUrls: ['./test-details.component.css']
})
export class TestDetailsComponent implements OnInit {
  test: Test = new Test();
  editedTest: Test = new Test();

  selectedQuestion: Question = new Question();
  answerIdsToDelete: number[] = [];

  chosenView!: string;

  isEditingTestLabel = false;
  isEditingTestDescription = false;
  isEditingTestQuestion = false;
  file!: File;
  imageUrl: string | null = null;

  @ViewChild('inputElement', { static: false }) inputElement!: ElementRef;

  constructor (private testService: TestService, private questionService: QuestionService, private answerService: AnswerService, private route: ActivatedRoute, private cdr: ChangeDetectorRef) { }


  ngOnInit() {
    let id = parseInt(this.route.snapshot.paramMap.get('id')!, 10);

    this.testService.getTestDetails(id).subscribe({
            next: (test) => {
              this.test = test;
              this.editedTest = JSON.parse(JSON.stringify(this.test)); // deep copy
              this.showTestDetails();

              for (let i = 0; i < this.test.questions.length; i++) {
                this.questionService.getQuestion(this.test.questions[i].id).subscribe({
                  next: (question) => {
                    this.test.questions[i].answers = question.answers;
                    this.test.questions[i].answers.forEach(answer => {
                      answer.questionId = question.id;
                    })

                    this.editedTest.questions[i].answers = JSON.parse(JSON.stringify(this.test.questions[i].answers));
                }
              });
            }
         }});
  }

  showTestDetails() {
    this.chosenView = 'test';
  }

  showQuestion() {
    this.chosenView = 'question';
  }


  editTestLabel() {
    this.isEditingTestLabel = true;
    setTimeout(() => this.inputElement.nativeElement.focus());
  }

  cancelTestLabelChange() {
    this.isEditingTestLabel = false;
    this.editedTest.name = this.test.name;
  }

  saveTestLabelChange() {
    this.isEditingTestLabel = false;
  }


  editTestDescription() {
    this.isEditingTestDescription = true;
    setTimeout(() => this.inputElement.nativeElement.focus());
  }

  cancelTestDescriptionChange() {
    this.isEditingTestDescription = false;
    this.editedTest.description = this.test.description;
  }

  saveTestDescriptionChange() {
    this.isEditingTestDescription = false;
  }


  areNewTestDetailsChanges() {
    return this.test.name !== this.editedTest.name || this.test.description !== this.editedTest.description;
  }

  saveTestDetailsChanges() {
    const updatedTest = {
      "id": this.editedTest.id,
      "name": this.editedTest.name,
      "description": this.editedTest.description
    }

    this.testService.updateTest(updatedTest.id, updatedTest).subscribe((newTest) => {
      this.test.name = newTest.name;
      this.test.description = newTest.description;
    })
  }

  deleteTest() {
    this.testService.deleteTest(this.test.id).subscribe({
      next: (response) => {
        console.log("test deleted successfully: ", response);
      },
      error: (response) => {
        console.log("test deleted not success: ", response);
      }
    })
  }


  selectQuestion(question_index_arr: number) {
    this.selectedQuestion = this.editedTest.questions[question_index_arr];
    this.imageUrl = this.getImageUrl(this.selectedQuestion.image_link);
    this.showQuestion();
  }


  editTestQuestion() {
    this.isEditingTestQuestion = true;
    setTimeout(() => this.inputElement.nativeElement.focus());
  }

  saveTestQuestionChange() {
    this.isEditingTestQuestion = false;
  }

  cancelTestQuestionChange() {
    this.isEditingTestQuestion = false;

    for (let i = 0; i < this.test.questions.length; i++) {
      if (this.test.questions[i].id === this.selectedQuestion.id) {
        this.selectedQuestion.question = this.test.questions[i].question;
      }
    }

  }


  changeGoodFalseAnswer(index: number) {
    this.selectedQuestion.answers[index].isCorrect = !this.selectedQuestion.answers[index].isCorrect;
  }

  createAddAnswer() {
    this.selectedQuestion.answers.push(new Answer(this.selectedQuestion.id));
    console.log(this.selectedQuestion.answers);
  }

  deleteAnswer(answer: Answer) {
    if (answer.id) {
      this.answerIdsToDelete.push(answer.id);
    }

    const index = this.selectedQuestion.answers.findIndex(ans => ans.id === answer.id);
    if (index !== -1) {
      this.selectedQuestion.answers.splice(index, 1);
    }
  }

  areNewQuestionChanges() {
    for (const question of this.test.questions) {
      if (question.id === this.selectedQuestion.id) {
        return this.selectedQuestion.question !== question.question ||
                this.selectedQuestion.type !== question.type ||
                !areArraysEqual(this.selectedQuestion.answers, question.answers);
      }
    }
    throw new Error('Question ids in looking for new changes doesnt match');
  }

  saveQuestionChanges() {
    if (!this.checkForProperAnswersPoints()) {
      alert('Answers has wrong points assigned.');
      return;
    }
    if (!this.checkForProperQuestionType()) {
      alert('Question has wrong type.');
      return;
    }

    this.answerIdsToDelete.forEach(answer_id => {
      this.answerService.deleteAnswer(answer_id).subscribe();
    });

    this.selectedQuestion.answers.forEach(answer => {
      if (answer.id) {
        this.answerService.updateAnswer(answer.id, answer).subscribe((res) => {
        })
      } else {
        this.answerService.createAnswer(answer).subscribe((res) => {
        })
      }
    })

    this.questionService.updateQuestion(this.selectedQuestion.id, this.selectedQuestion).subscribe({
      next: (updatedQuestion) => {
        const index = this.test.questions.findIndex(question => question.id === this.selectedQuestion.id);
        this.selectedQuestion.question = updatedQuestion.question;
        this.selectedQuestion.type = updatedQuestion.type;
        if (this.file) {
          const reader = new FileReader();
          reader.readAsArrayBuffer(this.file);
          reader.onload = () => {
            const blob = new Blob([reader.result as ArrayBuffer], { type: this.file.type });
            this.selectedQuestion.image_link = blob;
          };
        }
        this.test.questions[index] = JSON.parse(JSON.stringify(this.selectedQuestion));
        this.test.questions = [...this.test.questions];


      },
      error: (err) => {
        console.log('Something went wrong with question update: ', err);
      }
    })
  }

  addQuestion() {
    this.questionService.createQuestion(new Question()).subscribe({
      next: (newQuestion) => {
        this.testService.addQuestion(this.test.id, newQuestion).subscribe({
          next: (response) => {
            let question = {
              ...newQuestion,
              answers: [],
              position: response.position
            };

            this.test.questions.push(question);
            this.editedTest.questions.push(JSON.parse(JSON.stringify(question)));

            this.selectQuestion(this.test.questions.length-1);
          }
        })
      }
    })
  }

  deleteQuestion() {
    this.questionService.deleteQuestion(this.selectedQuestion.id).subscribe({
      next: () => {
        for (let i = 0; i < this.test.questions.length; i++) {
          if (this.test.questions[i].id === this.selectedQuestion.id) {
            this.test.questions.splice(i, 1);
            this.editedTest.questions.splice(i, 1);
            this.showTestDetails();
            break;
          }
        }
      },
      error: (err) => {
        console.log('Deleting question error: ', err);
      }
    })
  }

  checkForProperAnswersPoints() {
    for (let i = 0; i < this.selectedQuestion.answers.length; i++) {
      if (this.selectedQuestion.answers[i].isCorrect && this.selectedQuestion.answers[i].points <= 0) return false;
      if (!this.selectedQuestion.answers[i].isCorrect && this.selectedQuestion.answers[i].points > 0) return false;
    }
    return true;
  }

  checkForProperQuestionType() {
    let correctAnswers = 0;
    for (let i = 0; i < this.selectedQuestion.answers.length; i++) {
      if (this.selectedQuestion.answers[i].isCorrect) correctAnswers += 1;
    }
    if (correctAnswers < 1) return false;
    if (this.selectedQuestion.type === 'single' && correctAnswers != 1) return false
    return true;
  }

  getQuestionMaxPoints() {
    let res = 0;
    this.selectedQuestion.answers.forEach(answer => {
      if (answer.isCorrect) res += answer.points;
    })
    return res;
  }

  onFileChange(event: any) {
    this.selectedQuestion.image_link = event.target.files[0]
    this.imageUrl = this.getImageUrl(this.selectedQuestion.image_link);
  }

  getImageUrl(imageData: any): string {
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

function areArraysEqual(arr1: any[], arr2: any[]): boolean {
  if (arr1.length !== arr2.length) {
    return false;
  }

  return arr1.every((obj1, index) => {
    const obj2 = arr2[index];
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  });
}
