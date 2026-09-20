import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RequestService } from '../../services/request.service';
import { HelpRequestService, HelpRequestResponse } from '../../services/help-request.service';
import { SupplyRequestResponse } from '../../models/supply-request';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-coordinator-dashboard',
  imports: [RouterLink],
  templateUrl: './coordinator-dashboard.html',
  styleUrl: './coordinator-dashboard.css'
})
export class CoordinatorDashboard {
  coordinatorLevel =
    localStorage.getItem('aidlinkxCoordinatorLevel') ||
    localStorage.getItem('resqgridCoordinatorLevel') ||
    'DISTRICT';

  requests: SupplyRequestResponse[] = [];
  helpRequests: HelpRequestResponse[] = [];
  priorityFilter: 'ALL' | 'NORMAL' | 'HIGH' | 'CRITICAL' = 'ALL';
  isLoading = true;
  errorMessage = '';
  updatingRequestId: number | null = null;
  updatingHelpRequestId: number | null = null;
  activePhoto: string | null = null;

  constructor(
    private requestService: RequestService,
    private helpRequestService: HelpRequestService,
    private authService: AuthService,
    private router: Router
  ) {
    this.loadRequests();
    this.loadHelpRequests();
  }

  get coordinatorTitle(): string {
    if (this.coordinatorLevel === 'NATIONAL') return 'National HQ Coordinator';
    if (this.coordinatorLevel === 'FIELD') return 'Field Rapid Response Coordinator';
    return 'District Relief Coordinator';
  }

  get currentUser() {
    return this.authService.currentUser;
  }

  loadRequests(): void {
    this.requestService.getAllRequests().subscribe({
      next: (data) => {
        this.requests = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Unable to load supply requests:', error);
        this.isLoading = false;
      }
    });
  }

  loadHelpRequests(): void {
    this.helpRequestService.getAllHelpRequests().subscribe({
      next: (data) => {
        this.helpRequests = data;
      },
      error: (error) => {
        console.error('Unable to load resident requests:', error);
      }
    });
  }

  get filteredRequests(): SupplyRequestResponse[] {
    if (this.priorityFilter === 'ALL') return this.requests;
    return this.requests.filter(request => request.priority === this.priorityFilter);
  }

  get filteredHelpRequests(): HelpRequestResponse[] {
    if (this.priorityFilter === 'ALL') return this.helpRequests;
    return this.helpRequests.filter(request => request.priority === this.priorityFilter);
  }

  get totalRequests(): number {
    return this.requests.length;
  }

  get criticalRequests(): number {
    return this.requests.filter(r => r.priority === 'CRITICAL').length;
  }

  get pendingRequests(): number {
    return this.requests.filter(r => r.status === 'PENDING').length;
  }

  get deliveredRequests(): number {
    return this.requests.filter(r => r.status === 'DELIVERED').length;
  }

  get totalHelpRequests(): number {
    return this.helpRequests.length;
  }

  get criticalHelpRequests(): number {
    return this.helpRequests.filter(r => r.priority === 'CRITICAL').length;
  }

  onPriorityFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.priorityFilter = select.value as 'ALL' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  }

  updateRequestStatus(
    request: SupplyRequestResponse,
    newStatus: 'ACCEPTED' | 'DISPATCHED' | 'DELIVERED'
  ): void {
    this.updatingRequestId = request.id;
    this.requestService.updateStatus(request.id, newStatus).subscribe({
      next: (updatedRequest) => {
        this.requests = this.requests.map(r => r.id === updatedRequest.id ? updatedRequest : r);
        this.updatingRequestId = null;
      },
      error: (error) => {
        console.error('Unable to update supply request:', error);
        alert('Unable to update request status. Check authorization.');
        this.updatingRequestId = null;
      }
    });
  }

  updateHelpRequestStatus(
    request: HelpRequestResponse,
    newStatus: 'ACCEPTED' | 'DISPATCHED' | 'DELIVERED'
  ): void {
    this.updatingHelpRequestId = request.id;
    this.helpRequestService.updateStatus(request.id, newStatus).subscribe({
      next: (updatedRequest) => {
        this.helpRequests = this.helpRequests.map(r => r.id === updatedRequest.id ? updatedRequest : r);
        this.updatingHelpRequestId = null;
      },
      error: (error) => {
        console.error('Unable to update resident request:', error);
        alert('Unable to update resident request. Check authorization.');
        this.updatingHelpRequestId = null;
      }
    });
  }

  openPhoto(photo: string): void {
    this.activePhoto = photo;
  }

  closePhoto(): void {
    this.activePhoto = null;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/coordinator-login']);
  }

  getNextStatus(status: SupplyRequestResponse['status']): 'ACCEPTED' | 'DISPATCHED' | 'DELIVERED' | null {
    if (status === 'PENDING') return 'ACCEPTED';
    if (status === 'ACCEPTED') return 'DISPATCHED';
    if (status === 'DISPATCHED') return 'DELIVERED';
    return null;
  }

  getNextHelpStatus(status: HelpRequestResponse['status']): 'ACCEPTED' | 'DISPATCHED' | 'DELIVERED' | null {
    if (status === 'PENDING') return 'ACCEPTED';
    if (status === 'ACCEPTED') return 'DISPATCHED';
    if (status === 'DISPATCHED') return 'DELIVERED';
    return null;
  }

  getHelpActionText(status: HelpRequestResponse['status']): string {
    if (status === 'PENDING') return 'Accept Request';
    if (status === 'ACCEPTED') return 'Dispatch Help';
    if (status === 'DISPATCHED') return 'Mark Delivered';
    return 'Successfully Delivered';
  }

  getPriorityClasses(priority: 'NORMAL' | 'HIGH' | 'CRITICAL'): string {
    if (priority === 'CRITICAL') {
      return 'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200';
    }
    if (priority === 'HIGH') {
      return 'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200';
    }
    return 'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200';
  }

  getStatusClasses(status: 'PENDING' | 'ACCEPTED' | 'DISPATCHED' | 'DELIVERED'): string {
    if (status === 'PENDING') return 'font-bold text-amber-600';
    if (status === 'ACCEPTED') return 'font-bold text-blue-600';
    if (status === 'DISPATCHED') return 'font-bold text-purple-600';
    return 'font-bold text-emerald-600';
  }
}
