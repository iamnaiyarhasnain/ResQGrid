import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


// Data sent to backend
export interface HelpRequestCreateRequest {

  name: string;

  location: string;

  peopleCount: number;

  helpType: string;

  priority: 'NORMAL' | 'HIGH' | 'CRITICAL';

  description: string;
}


// Data received from backend
export interface HelpRequestResponse {

  id: number;

  name: string;

  location: string;

  peopleCount: number;

  helpType: string;

  priority: 'NORMAL' | 'HIGH' | 'CRITICAL';

  description: string;

  status:
    'PENDING'
    | 'ACCEPTED'
    | 'DISPATCHED'
    | 'DELIVERED';
}


@Injectable({
  providedIn: 'root'
})
export class HelpRequestService {

  // Backend API
  private apiUrl =
    'http://localhost:8080/api/help-requests';

  // Browser storage key
  private queueKey =
    'resqgrid-help-request-queue';


  constructor(
    private http: HttpClient
  ) {

    // When internet comes back,
    // automatically send queued requests.
    window.addEventListener(
      'online',
      () => this.flushQueuedRequests()
    );

    // Try sending previously queued requests
    // when the application starts.
    if (navigator.onLine) {
      this.flushQueuedRequests();
    }
  }


  // ==========================================
  // ONLINE API
  // ==========================================

  createHelpRequest(
    request: HelpRequestCreateRequest
  ): Observable<HelpRequestResponse> {

    return this.http.post<HelpRequestResponse>(
      this.apiUrl,
      request
    );
  }


  // Get all resident requests
  getAllHelpRequests():
    Observable<HelpRequestResponse[]> {

    return this.http.get<HelpRequestResponse[]>(
      this.apiUrl
    );
  }


  // Update request status
  updateStatus(
    id: number,
    status:
      'ACCEPTED'
      | 'DISPATCHED'
      | 'DELIVERED'
  ): Observable<HelpRequestResponse> {

    return this.http.patch<HelpRequestResponse>(
      `${this.apiUrl}/${id}/status?status=${status}`,
      {}
    );
  }


  // ==========================================
  // OFFLINE QUEUE
  // ==========================================

  // Save request inside browser
  queueRequest(
    request: HelpRequestCreateRequest
  ): void {

    // Get existing queued requests
    const queue =
      this.getQueuedRequests();

    // Add new request
    queue.push(request);

    // Save back to browser
    localStorage.setItem(
      this.queueKey,
      JSON.stringify(queue)
    );

    console.log(
      'Request stored offline:',
      request
    );
  }


  // Get all requests stored offline
  getQueuedRequests():
    HelpRequestCreateRequest[] {

    const stored =
      localStorage.getItem(this.queueKey);

    if (!stored) {
      return [];
    }

    try {

      return JSON.parse(stored);

    } catch {

      return [];
    }
  }


  // Number of requests waiting for sync
  getQueuedRequestCount(): number {

    return this.getQueuedRequests().length;
  }


  // ==========================================
  // STORE-AND-FORWARD
  // ==========================================

  flushQueuedRequests(): void {

    // Don't try to send if still offline
    if (!navigator.onLine) {
      return;
    }

    const queue =
      this.getQueuedRequests();

    // Nothing waiting
    if (queue.length === 0) {
      return;
    }

    console.log(
      `Syncing ${queue.length} offline request(s)...`
    );


    // Send requests one by one
    this.sendQueuedRequests(
      queue,
      0
    );
  }


  private sendQueuedRequests(
    queue: HelpRequestCreateRequest[],
    index: number
  ): void {

    // All requests have been processed
    if (index >= queue.length) {

      // Clear queue
      localStorage.removeItem(
        this.queueKey
      );

      console.log(
        'Offline requests synced successfully.'
      );

      return;
    }


    // Send current request
    this.createHelpRequest(
      queue[index]
    )
    .subscribe({

      next: (response) => {

        console.log(
          'Offline request synced:',
          response
        );

        // Continue with next request
        this.sendQueuedRequests(
          queue,
          index + 1
        );
      },


      error: (error) => {

        console.error(
          'Offline sync stopped:',
          error
        );

        // Keep remaining requests in storage.
        const remaining =
          queue.slice(index);

        localStorage.setItem(
          this.queueKey,
          JSON.stringify(remaining)
        );
      }

    });
  }
}