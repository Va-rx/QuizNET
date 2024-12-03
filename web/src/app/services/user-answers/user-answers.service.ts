import { Injectable } from '@angular/core';
import {AuthService} from "../auth/auth.service";

@Injectable({
  providedIn: 'root'
})
export class UserAnswersService {

  selectedAnswers: Map<number, number[]> = new Map<number, number[]>();
  constructor(private authService: AuthService) {}

  save(key: number, value: number[]): void {
    this.selectedAnswers.set(key, value);
    localStorage.setItem(this.storageKey, JSON.stringify(Array.from(this.selectedAnswers.entries())));
  }

  update(key: number, value: number[]): void {
    this.selectedAnswers.set(key, value);
    localStorage.setItem(this.storageKey, JSON.stringify(Array.from(this.selectedAnswers.entries())));
  }

  get(): string | null {
    return localStorage.getItem(this.storageKey);
  }

  remove(): void {
    localStorage.removeItem(this.storageKey);
  }

  getWrappedResult(testId: number)  {
      let storageAnswers = this.get();
      let answersMap: Map<number, number[]> = new Map();
      if (storageAnswers) {
        answersMap = new Map(JSON.parse(storageAnswers));
      }
      const result = {
        testId: testId,
        userId: this.authService.getUserId(),
        answers: Array.from(answersMap.entries()),
        score: 0
      }
      this.remove();

      return  JSON.stringify(result);
  }

  private get storageKey(): string {
    return 'user-answers';
  }
}