export class TestHistory {
    id!: number;
    testName!: string;
    description!: string;
    createdAt!: Date;
    questions?: QuestionHistory[];
}

export class QuestionHistory {
  id!: number;
  question!: string;
  answers!: AnswerHistory[];
}

export class AnswerHistory {
  id!: number;
  answer!: string;
  isCorrect!: boolean;
  selected!: boolean;
}
