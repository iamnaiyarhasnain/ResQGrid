import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, timeout } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { AuthService } from './auth.service';

export interface HelpRequestCreateRequest {
  clientRequestId: string;
  name: string;
  location: string;
  peopleCount: number;
  helpType: string;
  priority: 'NORMAL' | 'HIGH' | 'CRITICAL';
  description: string;
  disasterType: string;
  disasterDetails?: string;
  contactPhone?: string;
  alternateContact?: string;
  landmark?: string;
  specialNeeds?: string;
  photoData?: string;
}

export interface HelpRequestResponse extends HelpRequestCreateRequest {
  id: number;
  status: 'PENDING' | 'ACCEPTED' | 'DISPATCHED' | 'DELIVERED';
}

export interface QueuedHelpRequest {
  request: HelpRequestCreateRequest;
  queuedAt: string;
  attempts: number;
}

@Injectable({ providedIn: 'root' })
export class HelpRequestService {
  private readonly apiUrl = `${API_BASE_URL}/help-requests`;
  private readonly queueKey = 'aidlinkx-help-request-queue-v3';
  private readonly legacyQueueKey = 'resqgrid-help-request-queue-v2';
  private isFlushing = false;

  readonly queuedRequests$ = new BehaviorSubject<QueuedHelpRequest[]>(this.getQueuedRequests());
  readonly queuedRequestCount$ = new BehaviorSubject<number>(this.getQueuedRequestCount());
  readonly syncCompleted$ = new Subject<{ syncedCount: number; lastSyncedAt: Date }>();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Check legacy queue migration
    this.migrateLegacyQueue();

    window.addEventListener('online', () => {
      this.flushQueuedRequests();
    });

    if (navigator.onLine) {
      setTimeout(() => this.flushQueuedRequests(), 1500);
    }
  }

  createHelpRequest(request: HelpRequestCreateRequest): Observable<HelpRequestResponse> {
    return this.http.post<HelpRequestResponse>(this.apiUrl, request, this.authService.authOptions)
      .pipe(timeout(9000));
  }

  getAllHelpRequests(): Observable<HelpRequestResponse[]> {
    return this.http.get<HelpRequestResponse[]>(this.apiUrl, this.authService.authOptions);
  }

  updateStatus(
    id: number,
    status: 'ACCEPTED' | 'DISPATCHED' | 'DELIVERED'
  ): Observable<HelpRequestResponse> {
    return this.http.patch<HelpRequestResponse>(
      `${this.apiUrl}/${id}/status?status=${status}`,
      {},
      this.authService.authOptions
    );
  }

  queueRequest(request: HelpRequestCreateRequest): void {
    const queue = this.getQueuedRequests();
    if (queue.some(item => item.request.clientRequestId === request.clientRequestId)) return;

    queue.push({ request, queuedAt: new Date().toISOString(), attempts: 0 });
    this.saveQueuedRequests(queue);
  }

  getQueuedRequestCount(): number {
    return this.getQueuedRequests().length;
  }

  flushQueuedRequests(): void {
    if (!navigator.onLine || this.isFlushing || this.getQueuedRequests().length === 0) return;
    this.isFlushing = true;
    this.flushNextRequest(0);
  }

  private flushNextRequest(syncedCount: number): void {
    const queue = this.getQueuedRequests();
    const queued = queue[0];

    if (!queued || !navigator.onLine) {
      this.isFlushing = false;
      if (syncedCount > 0) {
        this.syncCompleted$.next({ syncedCount, lastSyncedAt: new Date() });
      }
      return;
    }

    this.createHelpRequest(queued.request).subscribe({
      next: () => {
        const remaining = queue.slice(1);
        this.saveQueuedRequests(remaining);
        this.flushNextRequest(syncedCount + 1);
      },
      error: (error) => {
        // If client-side validation failed permanently on backend (400), don't block the queue
        if (error?.status === 400) {
          console.warn('Queued request rejected by server validation, removing from queue:', queued);
          const remaining = queue.slice(1);
          this.saveQueuedRequests(remaining);
          this.flushNextRequest(syncedCount);
          return;
        }

        // Otherwise increment retry attempts and wait for next connection window
        queue[0] = { ...queued, attempts: (queued.attempts || 0) + 1 };
        this.saveQueuedRequests(queue);
        this.isFlushing = false;
      }
    });
  }

  getQueuedRequests(): QueuedHelpRequest[] {
    const stored = localStorage.getItem(this.queueKey) || localStorage.getItem(this.legacyQueueKey);
    if (!stored) return [];

    try {
      const queue = JSON.parse(stored) as QueuedHelpRequest[];
      return Array.isArray(queue) ? queue : [];
    } catch {
      return [];
    }
  }

  private saveQueuedRequests(queue: QueuedHelpRequest[]): void {
    if (queue.length === 0) {
      localStorage.removeItem(this.queueKey);
      localStorage.removeItem(this.legacyQueueKey);
    } else {
      localStorage.setItem(this.queueKey, JSON.stringify(queue));
    }
    this.queuedRequests$.next(queue);
    this.queuedRequestCount$.next(queue.length);
  }

  private migrateLegacyQueue(): void {
    const legacy = localStorage.getItem(this.legacyQueueKey);
    if (legacy && !localStorage.getItem(this.queueKey)) {
      localStorage.setItem(this.queueKey, legacy);
      localStorage.removeItem(this.legacyQueueKey);
    }
  }
}
