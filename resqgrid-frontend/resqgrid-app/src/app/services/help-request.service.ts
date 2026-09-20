import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';

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

    // When internet comes back, automatically
    // synchronize requests saved while offline.
    window.addEventListener('online', () => {

      console.log('Internet connection restored.');

      this.flushQueuedRequests();
    });


    // If the application starts while online,
    // try to synchronize any previous requests.
    if (navigator.onLine) {

      this.flushQueuedRequests();
    }
  }


  // ==========================================
  // CREATE HELP REQUEST
  // ==========================================

  createHelpRequest(
    request: HelpRequestCreateRequest
  ): Observable<HelpRequestResponse> {

    /*
     * timeout(5000)
     *
     * The request will wait for a maximum of
     * 5 seconds.
     *
     * This is important for ResQGrid because
     * an unstable network should not leave the
     * resident stuck on "Saving Request..."
     */
    return this.http
      .post<HelpRequestResponse>(
        this.apiUrl,
        request
      )
      .pipe(
        timeout(5000)
      );
  }


  // ==========================================
  // GET ALL HELP REQUESTS
  // ==========================================

  getAllHelpRequests(): Observable<HelpRequestResponse[]> {

    return this.http.get<HelpRequestResponse[]>(
      this.apiUrl
    );
  }


  // ==========================================
  // UPDATE REQUEST STATUS
  // ==========================================

  updateStatus(
    id: number,
    status: 'ACCEPTED' | 'DISPATCHED' | 'DELIVERED'
  ): Observable<HelpRequestResponse> {

    return this.http.patch<HelpRequestResponse>(
      `${this.apiUrl}/${id}/status?status=${status}`,
      {}
    );
  }


  // ==========================================
  // SAVE REQUEST LOCALLY
  // ==========================================

  queueRequest(
    request: HelpRequestCreateRequest
  ): void {

    // Get existing offline requests
    const queue = this.getQueuedRequests();

    // Add the new request
    queue.push(request);

    // Save everything to browser LocalStorage
    localStorage.setItem(
      this.queueKey,
      JSON.stringify(queue)
    );

    console.log(
      'Request stored offline:',
      request
    );
  }


  // ==========================================
  // GET OFFLINE REQUESTS
  // ==========================================

  getQueuedRequests(): HelpRequestCreateRequest[] {

    const stored =
      localStorage.getItem(this.queueKey);

    // No saved requests
    if (!stored) {
      return [];
    }

    try {

      return JSON.parse(stored);

    } catch {

      // Invalid LocalStorage data
      return [];
    }
  }


  // ==========================================
  // GET OFFLINE QUEUE COUNT
  // ==========================================

  getQueuedRequestCount(): number {

    return this.getQueuedRequests().length;
  }


  // ==========================================
  // SYNCHRONIZE OFFLINE REQUESTS
  // ==========================================

  flushQueuedRequests(): void {

    // Don't try to synchronize while offline
    if (!navigator.onLine) {

      console.log(
        'Still offline. Sync postponed.'
      );

      return;
    }

    // Get saved requests
    const queue =
      this.getQueuedRequests();

    // Nothing to synchronize
    if (queue.length === 0) {

      console.log(
        'No offline requests waiting.'
      );

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


  // ==========================================
  // SEND QUEUED REQUESTS ONE BY ONE
  // ==========================================

  private sendQueuedRequests(
    queue: HelpRequestCreateRequest[],
    index: number
  ): void {

    // All requests synchronized
    if (index >= queue.length) {

      // Remove offline queue
      localStorage.removeItem(
        this.queueKey
      );

      console.log(
        'All offline requests synced successfully.'
      );

      return;
    }


    // Make sure internet is still available
    if (!navigator.onLine) {

      console.log(
        'Connection lost during synchronization.'
      );

      // Keep remaining requests
      const remaining =
        queue.slice(index);

      localStorage.setItem(
        this.queueKey,
        JSON.stringify(remaining)
      );

      return;
    }


    // Send current request
    this.createHelpRequest(
      queue[index]
    ).subscribe({

      // Request successfully saved on AWS
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


      // Synchronization failed
      error: (error) => {

        console.error(
          'Offline sync failed:',
          error
        );

        // Keep the current request and
        // all remaining requests.
        const remaining =
          queue.slice(index);

        localStorage.setItem(
          this.queueKey,
          JSON.stringify(remaining)
        );

        console.log(
          'Requests kept in LocalStorage for retry.'
        );
      }

    });
  }
}