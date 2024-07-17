export class Question {
  id?: any;
  question: string = '';
  image_link?: string | null | File;
  answers?: Answer[];
  points!: number;
}

export class Answer {
  questionId?: number;
  answer!: string;
  isCorrect?: boolean;
  percentagePoints!: number;
}
