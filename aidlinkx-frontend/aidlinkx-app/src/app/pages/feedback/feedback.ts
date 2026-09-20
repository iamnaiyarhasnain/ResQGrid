import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FeedbackService } from '../../services/feedback.service';
import { AuthService, AuthUser } from '../../services/auth.service';

@Component({
  selector: 'app-feedback',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './feedback.html',
  styleUrl: './feedback.css'
})
export class FeedbackPage implements OnInit {
  feedbackForm: FormGroup;
  currentUser: AuthUser | null = null;
  selectedRating = 5;
  hoverRating = 0;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  readonly ratingLabels: Record<number, string> = {
    1: 'Needs urgent improvement',
    2: 'Below expectations',
    3: 'Satisfactory / functional',
    4: 'Helpful & dependable',
    5: 'Life-saving & excellent'
  };

  readonly feedbackCategories = [
    'Relief & Rescue Dispatch Speed',
    'Application Usability / Offline Experience',
    'Camp Coordination & Supply Accuracy',
    'Communications & Response Team Behavior',
    'Technical Bug or System Glitch',
    'General Suggestions & Appreciation'
  ];

  constructor(
    private fb: FormBuilder,
    private feedbackService: FeedbackService,
    private authService: AuthService
  ) {
    this.currentUser = this.authService.currentUser;
    this.feedbackForm = this.fb.group({
      name: [this.currentUser?.name || ''],
      email: [this.currentUser?.email || '', [Validators.email]],
      category: ['Relief & Rescue Dispatch Speed', Validators.required],
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      message: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(1000)]]
    });
  }

  ngOnInit(): void {
    if (this.currentUser) {
      if (this.currentUser.name && !this.feedbackForm.get('name')?.value) {
        this.feedbackForm.patchValue({ name: this.currentUser.name });
      }
      if (this.currentUser.email && !this.feedbackForm.get('email')?.value) {
        this.feedbackForm.patchValue({ email: this.currentUser.email });
      }
    }
  }

  setRating(rating: number): void {
    this.selectedRating = rating;
    this.feedbackForm.patchValue({ rating });
  }

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.feedbackForm.invalid) {
      this.feedbackForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formVal = this.feedbackForm.value;
    const combinedMessage = `[Category: ${formVal.category}]\n${formVal.message}`;

    this.feedbackService.submit({
      name: formVal.name?.trim() || undefined,
      email: formVal.email?.trim() || undefined,
      rating: Number(formVal.rating),
      message: combinedMessage
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'Thank you for sharing your feedback! Responders and humanitarian coordinators value every voice to improve relief efforts.';
        this.feedbackForm.reset({
          name: this.currentUser?.name || '',
          email: this.currentUser?.email || '',
          category: 'Relief & Rescue Dispatch Speed',
          rating: 5,
          message: ''
        });
        this.selectedRating = 5;
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err?.error?.message || 'Unable to submit feedback right now. Please check your network or try again shortly.';
      }
    });
  }
}
