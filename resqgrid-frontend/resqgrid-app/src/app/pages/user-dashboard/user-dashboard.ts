import {
  Component,
  HostListener
} from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  HelpRequestService,
  HelpRequestCreateRequest,
  HelpRequestResponse
} from '../../services/help-request.service';

@Component({
  selector: 'app-user-dashboard',

  imports: [
    ReactiveFormsModule
  ],

  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.css'
})
export class UserDashboard {

  // Resident help request form
  helpRequestForm: FormGroup;

  // Success message
  successMessage = '';

  // Error message
  errorMessage = '';

  // Loading state
  isSubmitting = false;

  // Generated request ID
  requestId: number | null = null;

  // Current network status
  isOnline = navigator.onLine;

  // Number of requests waiting for synchronization
  queuedRequestCount = 0;


  constructor(
    private formBuilder: FormBuilder,
    private helpRequestService: HelpRequestService
  ) {

    // Create reactive form
    this.helpRequestForm =
      this.formBuilder.group({

        name: [
          '',
          Validators.required
        ],

        location: [
          '',
          Validators.required
        ],

        peopleCount: [
          '',
          [
            Validators.required,
            Validators.min(1)
          ]
        ],

        helpType: [
          '',
          Validators.required
        ],

        priority: [
          '',
          Validators.required
        ],

        description: [
          '',
          [
            Validators.required,
            Validators.minLength(5)
          ]
        ]

      });

    // Check if there are already
    // requests waiting for synchronization.
    this.updateQueueCount();
  }


  // ==========================================
  // INTERNET CONNECTION RESTORED
  // ==========================================

  @HostListener('window:online')
  onOnline(): void {

    // Update network status
    this.isOnline = true;

    // Tell the user that connection is back
    this.successMessage =
      ' Connection restored. Syncing offline requests...';

    // Try to send all requests that
    // were saved while offline.
    this.helpRequestService.flushQueuedRequests();

    // Update the number of queued requests
    this.updateQueueCount();
  }


  // ==========================================
  // INTERNET CONNECTION LOST
  // ==========================================

  @HostListener('window:offline')
  onOffline(): void {

    // Update network status
    this.isOnline = false;

    // Inform the resident
    this.successMessage =
      ' You are offline. New requests will be stored safely on this device.';
  }


  // ==========================================
  // UPDATE OFFLINE QUEUE COUNT
  // ==========================================

  updateQueueCount(): void {

    this.queuedRequestCount =
      this.helpRequestService.getQueuedRequestCount();
  }


  // ==========================================
  // SUBMIT HELP REQUEST
  // ==========================================

  onSubmit(): void {

    // Clear previous messages
    this.successMessage = '';
    this.errorMessage = '';

    // Clear previous request ID
    this.requestId = null;


    // ==========================================
    // VALIDATE FORM
    // ==========================================

    if (this.helpRequestForm.invalid) {

      // Show validation errors
      this.helpRequestForm.markAllAsTouched();

      return;
    }


    // Prevent duplicate clicks
    this.isSubmitting = true;


    // Get form data
    const request: HelpRequestCreateRequest =
      this.helpRequestForm.value;


    // ==========================================
    // CHECK CURRENT NETWORK STATUS
    // ==========================================

    // IMPORTANT:
    // Use navigator.onLine directly here.
    // This checks the browser's CURRENT status
    // instead of relying only on our variable.
    if (!navigator.onLine) {

      // Save request locally
      this.helpRequestService.queueRequest(request);

      // Tell user that request was saved
      this.successMessage =
        'You are offline. Your request has been saved on this device and will be sent automatically when the connection returns.';

      // Reset form
      this.helpRequestForm.reset();

      // Stop loading
      this.isSubmitting = false;

      // Update queue count
      this.updateQueueCount();

      return;
    }


    // ==========================================
    // ONLINE MODE
    // ==========================================

    this.helpRequestService
      .createHelpRequest(request)
      .subscribe({

        // ======================================
        // REQUEST SUCCESS
        // ======================================

        next: (response: HelpRequestResponse) => {

          // Show success message
          this.successMessage =
            ' Your help request has been submitted successfully.';

          // Store generated request ID
          this.requestId = response.id;

          console.log(
            'Help request created:',
            response
          );

          // Reset form
          this.helpRequestForm.reset();

          // Stop loading
          this.isSubmitting = false;
        },


        // ======================================
        // REQUEST FAILED
        // ======================================

        error: (error) => {

          console.error(
            'Request failed:',
            error
          );


          // Check CURRENT browser connection.
          // The connection might have disappeared
          // after the request started.
          if (!navigator.onLine) {

            // Save request locally
            this.helpRequestService.queueRequest(request);

            // Tell the user
            this.successMessage =
              ' Connection lost. Your request has been saved offline and will be sent automatically when the connection returns.';

            // Reset form
            this.helpRequestForm.reset();

            // Update queue count
            this.updateQueueCount();

          } else {

            // Internet is available but
            // the backend returned an error.
            this.errorMessage =
              ' Unable to submit your request. Please try again.';
          }


          // Stop loading
          this.isSubmitting = false;
        }

      });
  }
}