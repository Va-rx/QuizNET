import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {PersonalityResults} from "../../models/user-personality-results";

const baseUrl = '/api/user-personality-results';
@Injectable({
  providedIn: 'root'
})
export class UserPersonalityResultsService {

  constructor(private http: HttpClient) {}

  create(data: PersonalityResults): any {
    return this.http.post(baseUrl, data);
  }

  getAveragePersonalityResults(testHistoryId: number): any {
    return this.http.get(`${baseUrl}/${testHistoryId}`);
  }

  getPlayerPersonalityResults(testHistoryId: number, userId: number): any {
    return this.http.get(`${baseUrl}/${testHistoryId}/${userId}`);
  }
}
