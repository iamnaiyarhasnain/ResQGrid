import { Component } from '@angular/core';

import { RequestService } from '../../services/request.service';

import {
  HelpRequestService,
  HelpRequestResponse
} from '../../services/help-request.service';

import { SupplyRequestResponse }
  from '../../models/supply-request';


@Component({
  selector: 'app-coordinator-dashboard',

  imports: [],

  templateUrl: './coordinator-dashboard.html',

  styleUrl: './coordinator-dashboard.css'
})
export class CoordinatorDashboard {

  // Existing camp supply requests
  requests: SupplyRequestResponse[] = [];

  // New resident help requests
  helpRequests: HelpRequestResponse[] = [];


  priorityFilter:
    'ALL' | 'NORMAL' | 'HIGH' | 'CRITICAL' = 'ALL';


  isLoading = true;

  errorMessage = '';

  updatingRequestId: number | null = null;

  updatingHelpRequestId: number | null = null;


  constructor(
    private requestService: RequestService,
    private helpRequestService: HelpRequestService
  ) {

    this.loadRequests();

    this.loadHelpRequests();
  }


  // Load camp supply requests
  loadRequests(): void {

    this.requestService
      .getAllRequests()
      .subscribe({

        next: (data) => {

          this.requests = data;

          this.isLoading = false;

          console.log(
            'Supply requests:',
            data
          );
        },

        error: (error) => {

          console.error(
            'Unable to load supply requests:',
            error
          );

          this.errorMessage =
            'Unable to load supply requests.';

          this.isLoading = false;
        }
      });
  }


  // Load resident help requests
  loadHelpRequests(): void {

    this.helpRequestService
      .getAllHelpRequests()
      .subscribe({

        next: (data) => {

          this.helpRequests = data;

          console.log(
            'Resident help requests:',
            data
          );
        },

        error: (error) => {

          console.error(
            'Unable to load resident requests:',
            error
          );
        }
      });
  }


  // Filter camp supply requests
  get filteredRequests():
    SupplyRequestResponse[] {

    if (this.priorityFilter === 'ALL') {
      return this.requests;
    }

    return this.requests.filter(
      request =>
        request.priority === this.priorityFilter
    );
  }


  // Filter resident requests
  get filteredHelpRequests():
    HelpRequestResponse[] {

    if (this.priorityFilter === 'ALL') {
      return this.helpRequests;
    }

    return this.helpRequests.filter(
      request =>
        request.priority === this.priorityFilter
    );
  }


  // Supply request statistics
  get totalRequests(): number {
    return this.requests.length;
  }


  get criticalRequests(): number {

    return this.requests.filter(
      request =>
        request.priority === 'CRITICAL'
    ).length;
  }


  get pendingRequests(): number {

    return this.requests.filter(
      request =>
        request.status === 'PENDING'
    ).length;
  }


  get deliveredRequests(): number {

    return this.requests.filter(
      request =>
        request.status === 'DELIVERED'
    ).length;
  }


  // Resident request statistics
  get totalHelpRequests(): number {
    return this.helpRequests.length;
  }


  get criticalHelpRequests(): number {

    return this.helpRequests.filter(
      request =>
        request.priority === 'CRITICAL'
    ).length;
  }


  // Change priority filter
  onPriorityFilterChange(event: Event): void {

    const select =
      event.target as HTMLSelectElement;

    this.priorityFilter =
      select.value as
      'ALL'
      | 'NORMAL'
      | 'HIGH'
      | 'CRITICAL';
  }


  // Update camp supply request status
  updateRequestStatus(
    request: SupplyRequestResponse,
    newStatus:
      'ACCEPTED'
      | 'DISPATCHED'
      | 'DELIVERED'
  ): void {

    this.updatingRequestId = request.id;

    this.requestService
      .updateStatus(
        request.id,
        newStatus
      )
      .subscribe({

        next: (updatedRequest) => {

          this.requests =
            this.requests.map(
              existingRequest =>
                existingRequest.id ===
                updatedRequest.id
                  ? updatedRequest
                  : existingRequest
            );

          this.updatingRequestId = null;
        },

        error: (error) => {

          console.error(
            'Unable to update supply request:',
            error
          );

          alert(
            'Unable to update request status.'
          );

          this.updatingRequestId = null;
        }
      });
  }


  // Update resident help request status
  updateHelpRequestStatus(
    request: HelpRequestResponse,
    newStatus:
      'ACCEPTED'
      | 'DISPATCHED'
      | 'DELIVERED'
  ): void {

    this.updatingHelpRequestId =
      request.id;

    this.helpRequestService
      .updateStatus(
        request.id,
        newStatus
      )
      .subscribe({

        next: (updatedRequest) => {

          this.helpRequests =
            this.helpRequests.map(
              existingRequest =>
                existingRequest.id ===
                updatedRequest.id
                  ? updatedRequest
                  : existingRequest
            );

          this.updatingHelpRequestId = null;
        },

        error: (error) => {

          console.error(
            'Unable to update resident request:',
            error
          );

          alert(
            'Unable to update resident request.'
          );

          this.updatingHelpRequestId = null;
        }
      });
  }


  // Get next status
  getNextStatus(
    status: SupplyRequestResponse['status']
  ):
    'ACCEPTED'
    | 'DISPATCHED'
    | 'DELIVERED'
    | null {

    if (status === 'PENDING') {
      return 'ACCEPTED';
    }

    if (status === 'ACCEPTED') {
      return 'DISPATCHED';
    }

    if (status === 'DISPATCHED') {
      return 'DELIVERED';
    }

    return null;
  }


  // Get next status for resident request
  getNextHelpStatus(
    status: HelpRequestResponse['status']
  ):
    'ACCEPTED'
    | 'DISPATCHED'
    | 'DELIVERED'
    | null {

    if (status === 'PENDING') {
      return 'ACCEPTED';
    }

    if (status === 'ACCEPTED') {
      return 'DISPATCHED';
    }

    if (status === 'DISPATCHED') {
      return 'DELIVERED';
    }

    return null;
  }


  // Button text for resident requests
  getHelpActionText(
    status: HelpRequestResponse['status']
  ): string {

    if (status === 'PENDING') {
      return 'Accept Request';
    }

    if (status === 'ACCEPTED') {
      return 'Dispatch Help';
    }

    if (status === 'DISPATCHED') {
      return 'Mark Delivered';
    }

    return 'Successfully Delivered';
  }


  // Priority CSS
  getPriorityClasses(
    priority:
      'NORMAL'
      | 'HIGH'
      | 'CRITICAL'
  ): string {

    if (priority === 'CRITICAL') {

      return 'inline-flex w-fit px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700';
    }

    if (priority === 'HIGH') {

      return 'inline-flex w-fit px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700';
    }

    return 'inline-flex w-fit px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700';
  }


  // Status CSS
  getStatusClasses(
    status:
      'PENDING'
      | 'ACCEPTED'
      | 'DISPATCHED'
      | 'DELIVERED'
  ): string {

    if (status === 'PENDING') {

      return 'font-semibold text-orange-600';
    }

    if (status === 'ACCEPTED') {

      return 'font-semibold text-blue-600';
    }

    if (status === 'DISPATCHED') {

      return 'font-semibold text-purple-600';
    }

    return 'font-semibold text-green-600';
  }
}