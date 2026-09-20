import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, timeout } from 'rxjs';
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
  photoData?: string;
}

export interface HelpRequestResponse extends HelpRequestCreateRequest {
  id: number;
  status: 'PENDING' | 'ACCEPTED' | 'DISPATCHED' | 'DELIVERED';
}

interface QueuedHelpRequest {
  request: HelpRequestCreateRequest;
  queuedAt: string;
  attempts: number;
}

@Injectable({ providedIn: 'root' })
export class HelpRequestService {
  private readonly apiUrl = `${API_BASE_URL}/help-requests`;
  private readonly queueKey = 'resqgrid-help-request-queue-v2';
  private isFlushing = false;
  readonly queuedRequestCount$ = new BehaviorSubject<number>(this.getQueuedRequestCount());

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    window.addEventListener('online', () => this.flushQueuedRequests());
    if (navigator.onLine) this.flushQueuedRequests();
  }

  createHelpRequest(request: HelpRequestCreateRequest): Observable<HelpRequestResponse> {
    return this.http.post<HelpRequestResponse>(this.apiUrl, request, this.authService.authOptions)
      .pipe(timeout(8000));
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
    this.flushNextRequest();
  }

  private flushNextRequest(): void {
    const queue = this.getQueuedRequests();
    const queued = queue[0];

    if (!queued || !navigator.onLine) {
      this.isFlushing = false;
      return;
    }

    this.createHelpRequest(queued.request).subscribe({
      next: () => {
        this.saveQueuedRequests(queue.slice(1));
        this.flushNextRequest();
      },
      error: () => {
        queue[0] = { ...queued, attempts: queued.attempts + 1 };
        this.saveQueuedRequests(queue);
        this.isFlushing = false;
      }
    });
  }

  private getQueuedRequests(): QueuedHelpRequest[] {
    const stored = localStorage.getItem(this.queueKey);
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
    } else {
      localStorage.setItem(this.queueKey, JSON.stringify(queue));
    }
    this.queuedRequestCount$.next(queue.length);
  }
}
