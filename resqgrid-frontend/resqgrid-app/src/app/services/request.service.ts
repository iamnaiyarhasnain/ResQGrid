import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { API_BASE_URL } from './api.config';

import {
  SupplyRequestCreateRequest,
  SupplyRequestResponse
} from '../models/supply-request';

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  // Live AWS ECS Spring Boot backend
  private apiUrl = `${API_BASE_URL}/requests`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Create a new camp supply request
  createRequest(
    request: SupplyRequestCreateRequest
  ): Observable<SupplyRequestResponse> {

    return this.http.post<SupplyRequestResponse>(
      this.apiUrl,
      request
    );
  }

  // Get all camp supply requests
  getAllRequests(): Observable<SupplyRequestResponse[]> {

    return this.http.get<SupplyRequestResponse[]>(
      this.apiUrl,
      this.authService.authOptions
    );
  }

  // Update the status of a supply request
  updateStatus(
    id: number,
    status: 'ACCEPTED' | 'DISPATCHED' | 'DELIVERED'
  ): Observable<SupplyRequestResponse> {

    return this.http.patch<SupplyRequestResponse>(
      `${this.apiUrl}/${id}/status?status=${status}`,
      {},
      this.authService.authOptions
    );
  }
}
