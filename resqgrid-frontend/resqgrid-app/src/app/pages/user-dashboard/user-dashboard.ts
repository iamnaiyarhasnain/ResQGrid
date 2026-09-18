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

  // Number of requests waiting for sync
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


    // Check offline queue
    this.updateQueueCount();
  }


  // Browser detected internet connection
  @HostListener('window:online')
  onOnline(): void {

    this.isOnline = true;

    // Try syncing queued requests
    this.helpRequestService
      .flushQueuedRequests();

    this.updateQueueCount();

    this.successMessage =
      '🟢 Connection restored. Syncing offline requests...';
  }


  // Browser detected network loss
  @HostListener('window:offline')
  onOffline(): void {

    this.isOnline = false;

    this.successMessage =
      '🟠 You are offline. New requests will be stored safely on this device.';
  }


  // Update queue count
  updateQueueCount(): void {

    this.queuedRequestCount =
      this.helpRequestService
        .getQueuedRequestCount();
  }


  // Submit request
  onSubmit(): void {

    // Clear old messages
    this.successMessage = '';
    this.errorMessage = '';
    this.requestId = null;


    // Validate form
    if (this.helpRequestForm.invalid) {

      this.helpRequestForm.markAllAsTouched();

      return;
    }


    this.isSubmitting = true;


    // Form data
    const request:
      HelpRequestCreateRequest =
        this.helpRequestForm.value;


    // ==========================================
    // OFFLINE MODE
    // ==========================================

    if (!this.isOnline) {

      // Store request in browser
      this.helpRequestService
        .queueRequest(request);


      this.successMessage =
        '🟠 You are offline. Your request has been saved on this device and will be sent automatically when the connection returns.';


      // Reset form
      this.helpRequestForm.reset();

      this.isSubmitting = false;

      this.updateQueueCount();

      return;
    }


    // ==========================================
    // ONLINE MODE
    // ==========================================

    this.helpRequestService
      .createHelpRequest(request)
      .subscribe({

        // Successfully sent
        next: (
          response: HelpRequestResponse
        ) => {

          this.successMessage =
            '✅ Your help request has been submitted successfully.';

          this.requestId =
            response.id;


          console.log(
            'Help request created:',
            response
          );


          this.helpRequestForm.reset();

          this.isSubmitting = false;
        },


        // Network/server failure
        error: (error) => {

          console.error(
            'Request failed:',
            error
          );


          // If the browser lost connection,
          // store the request locally.
          if (!navigator.onLine) {

            this.helpRequestService
              .queueRequest(request);


            this.successMessage =
              '🟠 Connection lost. Your request has been saved offline and will be sent automatically when the connection returns.';


            this.helpRequestForm.reset();

            this.updateQueueCount();

          } else {

            this.errorMessage =
              '❌ Unable to submit your request. Please try again.';
          }


          this.isSubmitting = false;
        }

      });
  }
}