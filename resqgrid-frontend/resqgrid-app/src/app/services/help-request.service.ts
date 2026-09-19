import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Data we send when creating a help request
export interface HelpRequestCreateRequest {
  name: string;
  location: string;
  peopleCount: number;
  helpType: string;
  priority: 'NORMAL' | 'HIGH' | 'CRITICAL';
  description: string;
}

// Data we receive from the backend
export interface HelpRequestResponse {
  id: number;
  name: string;
  location: string;
  peopleCount: number;
  helpType: string;
  priority: 'NORMAL' | 'HIGH' | 'CRITICAL';
  description: string;
  status: 'PENDING' | 'ACCEPTED' | 'DISPATCHED' | 'DELIVERED';
}

@Injectable({
  providedIn: 'root'
})
export class HelpRequestService {

  // Live AWS ECS Spring Boot backend
  private apiUrl =
    'https://re-388d9066c92b42fa88b473a6a464be9b.ecs.ap-southeast-2.on.aws/api/help-requests';

  // LocalStorage key used for offline requests
  private queueKey = 'resqgrid-help-request-queue';

  constructor(private http: HttpClient) {

    // When internet comes back, automatically sync
    // requests that were saved while offline.
    window.addEventListener('online', () => {
      this.flushQueuedRequests();
    });

    // If the application starts while online,
    // try to sync any previously queued requests.
    if (navigator.onLine) {
      this.flushQueuedRequests();
    }
  }

  // Send a new help request to the AWS backend
  createHelpRequest(
    request: HelpRequestCreateRequest
  ): Observable<HelpRequestResponse> {

    return this.http.post<HelpRequestResponse>(
      this.apiUrl,
      request
    );
  }

  // Get all resident help requests
  getAllHelpRequests(): Observable<HelpRequestResponse[]> {

    return this.http.get<HelpRequestResponse[]>(
      this.apiUrl
    );
  }

  // Update the status of a help request
  updateStatus(
    id: number,
    status: 'ACCEPTED' | 'DISPATCHED' | 'DELIVERED'
  ): Observable<HelpRequestResponse> {

    return this.http.patch<HelpRequestResponse>(
      `${this.apiUrl}/${id}/status?status=${status}`,
      {}
    );
  }

  // Store a request in the browser when the user is offline
  queueRequest(
    request: HelpRequestCreateRequest
  ): void {

    const queue = this.getQueuedRequests();

    // Add the new request to the offline queue
    queue.push(request);

    // Save the queue in browser LocalStorage
    localStorage.setItem(
      this.queueKey,
      JSON.stringify(queue)
    );

    console.log('Request stored offline:', request);
  }

  // Get all requests currently waiting for internet
  getQueuedRequests(): HelpRequestCreateRequest[] {

    const stored = localStorage.getItem(
      this.queueKey
    );

    // No queued requests
    if (!stored) {
      return [];
    }

    try {

      return JSON.parse(stored);

    } catch {

      // If LocalStorage contains invalid data,
      // return an empty queue instead of crashing.
      return [];
    }
  }

  // Get number of requests waiting for synchronization
  getQueuedRequestCount(): number {

    return this.getQueuedRequests().length;
  }

  // Send all offline requests when internet returns
  flushQueuedRequests(): void {

    // Do nothing if internet is still unavailable
    if (!navigator.onLine) {
      return;
    }

    const queue = this.getQueuedRequests();

    // Nothing to synchronize
    if (queue.length === 0) {
      return;
    }

    console.log(
      `Syncing ${queue.length} offline request(s)...`
    );

    this.sendQueuedRequests(queue, 0);
  }

  // Send queued requests one by one
  private sendQueuedRequests(
    queue: HelpRequestCreateRequest[],
    index: number
  ): void {

    // All requests successfully synchronized
    if (index >= queue.length) {

      localStorage.removeItem(
        this.queueKey
      );

      console.log(
        'Offline requests synced successfully.'
      );

      return;
    }

    // Send the current queued request
    this.createHelpRequest(
      queue[index]
    ).subscribe({

      next: (response) => {

        console.log(
          'Offline request synced:',
          response
        );

        // Move to the next request
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

        // Keep the remaining requests
        // so they can be retried later.
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