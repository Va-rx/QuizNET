export class Question {
  id?: any;
  question: string = '';
  image_link?: string | null | File;
  answers?: Answer[];
}

export class Answer {
  id?: number;
  questionId?: number;
  answer!: string;
  isCorrect?: boolean;
}
