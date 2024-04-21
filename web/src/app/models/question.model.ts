export class Question {
  id?: any;
  question?: string;
  answers?: Answer[];
}

export class Answer {
  answer!: string;
  isCorrect?: boolean;
}