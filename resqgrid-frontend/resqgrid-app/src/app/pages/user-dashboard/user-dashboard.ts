import { Component, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  HelpRequestCreateRequest,
  HelpRequestResponse,
  HelpRequestService
} from '../../services/help-request.service';
import { AuthService, AuthUser } from '../../services/auth.service';

@Component({
  selector: 'app-user-dashboard',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.css'
})
export class UserDashboard {
  helpRequestForm: FormGroup;
  authForm: FormGroup;
  successMessage = '';
  errorMessage = '';
  authErrorMessage = '';
  isSubmitting = false;
  isAuthSubmitting = false;
  requestId: number | null = null;
  isOnline = navigator.onLine;
  queuedRequestCount = 0;
  showAuthPanel = false;
  authMode: 'register' | 'login' = 'register';
  currentUser: AuthUser | null;
  photoData = '';
  photoName = '';

  readonly disasterTypes = [
    'Flood', 'Earthquake', 'Cyclone / storm', 'Landslide',
    'Wildfire', 'Heatwave', 'Industrial accident', 'Other'
  ];

  constructor(
    private formBuilder: FormBuilder,
    private helpRequestService: HelpRequestService,
    private authService: AuthService
  ) {
    this.currentUser = this.authService.currentUser;
    this.helpRequestForm = this.formBuilder.group({
      name: ['', Validators.required],
      location: ['', Validators.required],
      peopleCount: ['', [Validators.required, Validators.min(1)]],
      helpType: ['', Validators.required],
      priority: ['', Validators.required],
      disasterType: ['', Validators.required],
      disasterDetails: [''],
      description: ['', [Validators.required, Validators.minLength(5)]]
    });
    this.authForm = this.formBuilder.group({
      name: [''],
      email: [''],
      phone: [''],
      identifier: [''],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
    this.updateQueueCount();
    this.helpRequestService.queuedRequestCount$.subscribe(count => {
      this.queuedRequestCount = count;
    });
  }

  @HostListener('window:online')
  onOnline(): void {
    this.isOnline = true;
    this.successMessage = 'Connection restored. Your saved requests are being synchronised.';
    this.helpRequestService.flushQueuedRequests();
  }

  @HostListener('window:offline')
  onOffline(): void {
    this.isOnline = false;
    this.successMessage = 'You are offline. New help requests will be saved safely on this device.';
  }

  updateQueueCount(): void {
    this.queuedRequestCount = this.helpRequestService.getQueuedRequestCount();
  }

  onDisasterTypeChange(): void {
    const disasterDetails = this.helpRequestForm.get('disasterDetails');
    if (this.helpRequestForm.get('disasterType')?.value === 'OTHER') {
      disasterDetails?.setValidators([Validators.required, Validators.minLength(3)]);
    } else {
      disasterDetails?.clearValidators();
      disasterDetails?.setValue('');
    }
    disasterDetails?.updateValueAndValidity();
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const photo = input.files?.[0];
    if (!photo) return;

    if (!photo.type.startsWith('image/')) {
      this.errorMessage = 'Please choose an image file for the optional reference photo.';
      input.value = '';
      return;
    }

    if (photo.size > 1_500_000) {
      this.errorMessage = 'Please choose a photo smaller than 1.5 MB so it can be saved offline.';
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.photoData = String(reader.result);
      this.photoName = photo.name;
      this.errorMessage = '';
    };
    reader.readAsDataURL(photo);
  }

  removePhoto(): void {
    this.photoData = '';
    this.photoName = '';
  }

  retryQueuedRequests(): void {
    this.helpRequestService.flushQueuedRequests();
    this.successMessage = this.isOnline
      ? 'Trying to send your saved requests now.'
      : 'Your requests remain safely saved until a connection returns.';
  }

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.requestId = null;

    if (this.helpRequestForm.invalid) {
      this.helpRequestForm.markAllAsTouched();
      return;
    }

    const formValue = this.helpRequestForm.value;
    const request: HelpRequestCreateRequest = {
      clientRequestId: this.createClientRequestId(),
      name: formValue.name,
      location: formValue.location,
      peopleCount: Number(formValue.peopleCount),
      helpType: formValue.helpType,
      priority: formValue.priority,
      description: formValue.description,
      disasterType: formValue.disasterType === 'Other' ? 'OTHER' : formValue.disasterType,
      disasterDetails: formValue.disasterDetails || undefined,
      photoData: this.photoData || undefined
    };

    if (!navigator.onLine) {
      this.saveRequestOffline(request, 'You are offline. Your request is saved on this device and will be sent automatically when connection returns.');
      return;
    }

    this.isSubmitting = true;
    this.helpRequestService.createHelpRequest(request).subscribe({
      next: (response: HelpRequestResponse) => {
        this.successMessage = 'Your help request has been submitted successfully.';
        this.requestId = response.id;
        this.resetHelpRequestForm();
        this.isSubmitting = false;
      },
      error: error => {
        if (this.isConnectivityFailure(error)) {
          this.saveRequestOffline(request, 'We could not reach relief coordination. Your request is saved safely and will retry automatically.');
        } else {
          this.errorMessage = error?.error?.message ?? 'Unable to submit your request. Please try again.';
          this.isSubmitting = false;
        }
      }
    });
  }

  openAuthPanel(mode: 'register' | 'login' = 'register'): void {
    this.authMode = mode;
    this.authErrorMessage = '';
    this.showAuthPanel = true;
  }

  setAuthMode(mode: 'register' | 'login'): void {
    this.authMode = mode;
    this.authErrorMessage = '';
    this.authForm.reset();
  }

  onAuthSubmit(): void {
    this.authErrorMessage = '';
    const value = this.authForm.value;

    if (this.authMode === 'register') {
      if (!value.name || (!value.email && !value.phone) || this.authForm.get('password')?.invalid) {
        this.authForm.markAllAsTouched();
        this.authErrorMessage = 'Add your name, a password, and either an email address or phone number.';
        return;
      }
      this.isAuthSubmitting = true;
      this.authService.register({
        name: value.name,
        email: value.email || undefined,
        phone: value.phone || undefined,
        password: value.password
      }).subscribe({
        next: response => this.completeAuthentication(response.user),
        error: error => this.handleAuthError(error)
      });
      return;
    }

    if (!value.identifier || this.authForm.get('password')?.invalid) {
      this.authForm.markAllAsTouched();
      this.authErrorMessage = 'Enter your email or phone number and password.';
      return;
    }
    this.isAuthSubmitting = true;
    this.authService.login(value.identifier, value.password).subscribe({
      next: response => this.completeAuthentication(response.user),
      error: error => this.handleAuthError(error)
    });
  }

  logout(): void {
    this.authService.logout();
    this.currentUser = null;
    this.successMessage = 'You have signed out. You can still submit an emergency request without an account.';
  }

  private completeAuthentication(user: AuthUser): void {
    this.currentUser = user;
    this.showAuthPanel = false;
    this.isAuthSubmitting = false;
    this.successMessage = `Welcome, ${user.name}. Your account is ready.`;
  }

  private handleAuthError(error: any): void {
    this.authErrorMessage = error?.error?.message ?? 'We could not complete that request. Please try again.';
    this.isAuthSubmitting = false;
  }

  private saveRequestOffline(request: HelpRequestCreateRequest, message: string): void {
    this.helpRequestService.queueRequest(request);
    this.successMessage = message;
    this.resetHelpRequestForm();
    this.isSubmitting = false;
  }

  private resetHelpRequestForm(): void {
    this.helpRequestForm.reset();
    this.removePhoto();
    this.onDisasterTypeChange();
  }

  private isConnectivityFailure(error: any): boolean {
    return !navigator.onLine || error?.status === 0 || error?.name === 'TimeoutError';
  }

  private createClientRequestId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return `rq-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}
