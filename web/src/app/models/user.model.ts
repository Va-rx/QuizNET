export class User {
    id?: number;
    nickname!: string;
    email!: string;
    password!: string;
    role!: Role;
    name!: string;
    surname!: string;
    index?: string;
}


export enum Role {
  NONE,
  USER,
  ADMIN
}
