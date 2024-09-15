import { Question } from "./question.model";

export class Test {
    id!: number;
    name!: string;
    description?: string;
    created_date!: Date;
    modified_date!: Date;
    max_points!: number;
    questions!: Question[];
}
