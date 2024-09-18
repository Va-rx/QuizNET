import { Question } from "./question.model";

export class Test {
    id!: number;
    name!: string;
    description?: string;
    createdDate!: Date;
    modifiedDate!: Date;
    maxPoints!: number;
    questions!: Question[];
}
