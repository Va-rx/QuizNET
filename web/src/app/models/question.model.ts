export class Question {
  id!: number;
  position?: number;
  question: string = 'New question'
  imageLink?: string | null | File;
  type: string = 'single';
  answers!: Answer[];
  maxPoints: number = 0;
}

export class Answer {
  id!: number;
  questionId!: number;
  answer: string = '';
  isCorrect: boolean = false;
  points: number = 0;

  constructor(questionId: number) {
    this.questionId = questionId;
  }
}
