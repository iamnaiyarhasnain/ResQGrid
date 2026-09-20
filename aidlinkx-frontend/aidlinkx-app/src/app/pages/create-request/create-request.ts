import { Component } from '@angular/core';

// Reactive Forms imports.
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

// Our request model.
import { SupplyRequestCreateRequest } from '../../models/supply-request';

// Service responsible for communicating
// with the Spring Boot backend.
import { RequestService } from '../../services/request.service';


@Component({
  selector: 'app-create-request',

  // ReactiveFormsModule is required because
  // our HTML uses Angular reactive-form directives.
  imports: [ReactiveFormsModule],

  templateUrl: './create-request.html',
  styleUrl: './create-request.css'
})
export class CreateRequest {

  // Represents the complete supply request form.
  supplyRequestForm: FormGroup;


  // This controls whether the success message
  // is displayed on the screen.
  successMessage = '';


  // This controls whether the error message
  // is displayed on the screen.
  errorMessage = '';


  // This helps us prevent multiple clicks
  // while the request is being sent.
  isSubmitting = false;


  // Inject FormBuilder and RequestService.
  constructor(
    private formBuilder: FormBuilder,
    private requestService: RequestService
  ) {

    // Create the reactive form.
    this.supplyRequestForm = this.formBuilder.group({

      // Camp ID is required.
      campId: [
        '',
        Validators.required
      ],

      // People affected must be at least 1.
      peopleAffected: [
        '',
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      // Water quantity cannot be negative.
      waterQuantity: [
        '',
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      // Food quantity cannot be negative.
      foodQuantity: [
        '',
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      // Medicine quantity cannot be negative.
      medicineQuantity: [
        '',
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      // Blanket quantity cannot be negative.
      blanketQuantity: [
        '',
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      // Priority is required.
      priority: [
        '',
        Validators.required
      ]

    });
  }


  // Runs when the user submits the form.
  onSubmit(): void {

    // Remove old messages before
    // processing a new submission.
    this.successMessage = '';
    this.errorMessage = '';


    // Check whether the form is valid.
    if (this.supplyRequestForm.invalid) {

      // Mark all fields as touched so
      // validation messages become visible.
      this.supplyRequestForm.markAllAsTouched();

      return;
    }


    // Prevent another submission while
    // the current request is being processed.
    this.isSubmitting = true;


    // Get the values from the Angular form.
    const request: SupplyRequestCreateRequest =
      this.supplyRequestForm.value;


    // Send the request to Spring Boot.
    this.requestService.createRequest(request)
      .subscribe({

        // Runs when Spring Boot responds successfully.
        next: (response) => {

          // Show success message.
          this.successMessage =
            ' Supply request submitted successfully!';


          // Print backend response for debugging.
          console.log(
            'Supply request created successfully:',
            response
          );


          // Clear the form after successful submission.
          this.supplyRequestForm.reset();


          // Allow the user to submit another request.
          this.isSubmitting = false;
        },


        // Runs when something goes wrong.
        error: (error) => {

          console.error(
            'Error creating supply request:',
            error
          );


          // Show an error message to the user.
          this.errorMessage =
            ' Unable to submit the supply request. Please try again.';


          // Allow the user to try again.
          this.isSubmitting = false;
        }

      });
  }
}