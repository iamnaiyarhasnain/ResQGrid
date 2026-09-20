import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';

export interface FeedbackCreateRequest {
  name?: string;
  email?: string;
  rating: number;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  constructor(private http: HttpClient) {}

  submit(feedback: FeedbackCreateRequest): Observable<unknown> {
    return this.http.post(`${API_BASE_URL}/feedback`, feedback);
  }
}
