import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  SupplyRequestCreateRequest,
  SupplyRequestResponse
} from '../models/supply-request';

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  // Live AWS ECS Spring Boot backend
  private apiUrl =
    'https://re-388d9066c92b42fa88b473a6a464be9b.ecs.ap-southeast-2.on.aws/api/requests';

  constructor(private http: HttpClient) {}

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
      this.apiUrl
    );
  }

  // Update the status of a supply request
  updateStatus(
    id: number,
    status: 'ACCEPTED' | 'DISPATCHED' | 'DELIVERED'
  ): Observable<SupplyRequestResponse> {

    return this.http.patch<SupplyRequestResponse>(
      `${this.apiUrl}/${id}/status?status=${status}`,
      {}
    );
  }
}