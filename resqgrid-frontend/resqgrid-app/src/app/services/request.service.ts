// ============================================================
// ResQGrid Request Service
// ============================================================


// Injectable allows Angular to create and use
// this service throughout the application.
import { Injectable } from '@angular/core';


// HttpClient is responsible for making
// HTTP requests to our Spring Boot backend.
import { HttpClient } from '@angular/common/http';


// Observable represents the asynchronous
// response from the backend.
import { Observable } from 'rxjs';


// Import our request models.
import {
  SupplyRequestCreateRequest,
  SupplyRequestResponse
} from '../models/supply-request';



@Injectable({
  // Creates one shared instance of this service
  // for the entire Angular application.
  providedIn: 'root'
})
export class RequestService {


  // Base URL of our Spring Boot API.
  private apiUrl = 'http://localhost:8080/api/requests';



  // Inject HttpClient.
  constructor(
    private http: HttpClient
  ) {}



  // ==========================================================
  // CREATE REQUEST
  // ==========================================================

  // Sends a new supply request to Spring Boot.
  createRequest(
    request: SupplyRequestCreateRequest
  ): Observable<SupplyRequestResponse> {

    return this.http.post<SupplyRequestResponse>(
      this.apiUrl,
      request
    );

  }



  // ==========================================================
  // GET ALL REQUESTS
  // ==========================================================

  // Gets all supply requests from Spring Boot.
  getAllRequests(): Observable<SupplyRequestResponse[]> {

    return this.http.get<SupplyRequestResponse[]>(
      this.apiUrl
    );

  }



  // ==========================================================
  // UPDATE REQUEST STATUS
  // ==========================================================

  // Changes the status of a supply request.
  //
  // Example:
  //
  // PENDING → ACCEPTED
  // ACCEPTED → DISPATCHED
  // DISPATCHED → DELIVERED

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