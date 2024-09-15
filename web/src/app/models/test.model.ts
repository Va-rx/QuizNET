import {Question} from "./question.model";

export class Test {
    id!: number;
    name!: string;
    description?: string;
    questions?: Question[];
}
