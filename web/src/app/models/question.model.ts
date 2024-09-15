export class Question {
  id!: number;
  position?: number;
  question!: string;
  image_link?: string | null | File;
  type!: string;
  answers!: Answer[];
}

export class Answer {
  id?: number;
  questionId!: number;
  answer: string = '';
  isCorrect: boolean = false;
  points: number = 0;

  constructor(questionId: number) {
    this.questionId = questionId;
  }
}
