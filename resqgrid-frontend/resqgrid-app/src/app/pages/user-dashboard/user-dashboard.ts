import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  HelpRequestCreateRequest,
  HelpRequestResponse,
  HelpRequestService,
  QueuedHelpRequest
} from '../../services/help-request.service';
import { AuthService, AuthUser } from '../../services/auth.service';

export interface EmergencyContact {
  name: string;
  number: string;
  category: string;
  badgeColor: string;
  icon: string;
}

@Component({
  selector: 'app-user-dashboard',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.css'
})
export class UserDashboard implements OnInit {
  helpRequestForm: FormGroup;
  authForm: FormGroup;
  successMessage = '';
  errorMessage = '';
  authErrorMessage = '';
  isSubmitting = false;
  isAuthSubmitting = false;
  requestId: number | null = null;
  lastClientRequestId = '';
  isOnline = navigator.onLine;
  queuedRequestCount = 0;
  queuedItems: QueuedHelpRequest[] = [];
  showAuthPanel = false;
  authMode: 'login' | 'register' = 'register';
  currentUser: AuthUser | null = null;
  photoData = '';
  photoName = '';
  copiedNumber = '';

  readonly disasterTypes = [
    'Flood / Inundation',
    'Earthquake',
    'Cyclone / Severe Storm',
    'Landslide / Mudflow',
    'Wildfire / Fire Outbreak',
    'Extreme Heatwave',
    'Tsunami / Coastal Surge',
    'Cloudburst / Flash Flood',
    'Industrial / Chemical Hazard',
    'Other'
  ];

  readonly specialNeedsOptions = [
    { id: 'infants', label: 'Infants / Small Children' },
    { id: 'elderly', label: 'Elderly (65+ years)' },
    { id: 'pregnant', label: 'Pregnant Women' },
    { id: 'mobility', label: 'Injured / Mobility Impaired' },
    { id: 'medication', label: 'Critical Medication Dependency' }
  ];

  selectedSpecialNeeds: string[] = [];

  readonly emergencyContacts: EmergencyContact[] = [
    {
      name: 'National Emergency Helpline',
      number: '112',
      category: 'Immediate Police & Rescue',
      badgeColor: 'bg-red-100 text-red-700 border-red-200',
      icon: '🚨'
    },
    {
      name: 'Ambulance & Medical Emergency',
      number: '108',
      category: 'Paramedics & Hospital Transfer',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: '🚑'
    },
    {
      name: 'Fire & Rescue Service',
      number: '101',
      category: 'Fire, Collapse & Extrication',
      badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: '🚒'
    },
    {
      name: 'State Disaster Response Control',
      number: '1070',
      category: 'Disaster Management HQ',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: '🌊'
    },
    {
      name: 'AidLinkX 24/7 Relief Dispatch',
      number: '+91 800 233 5465',
      category: 'Humanitarian Grid Support Desk',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: '📡'
    }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private helpRequestService: HelpRequestService,
    private authService: AuthService
  ) {
    this.currentUser = this.authService.currentUser;

    this.helpRequestForm = this.formBuilder.group({
      name: [this.currentUser?.name || '', [Validators.required, Validators.minLength(2)]],
      contactPhone: [this.currentUser?.phone || '', [Validators.required, Validators.pattern(/^[0-9+ -]{7,16}$/)]],
      alternateContact: ['', [Validators.pattern(/^[0-9+ -]{7,16}$/)]],
      location: ['', [Validators.required, Validators.minLength(3)]],
      landmark: [''],
      peopleCount: [1, [Validators.required, Validators.min(1), Validators.max(5000)]],
      helpType: ['', Validators.required],
      priority: ['HIGH', Validators.required],
      disasterType: ['Flood / Inundation', Validators.required],
      disasterDetails: [''],
      description: ['', [Validators.required, Validators.minLength(5)]]
    });

    this.authForm = this.formBuilder.group({
      name: [''],
      email: [''],
      phone: [''],
      identifier: [''],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.updateQueueCount();

    this.helpRequestService.queuedRequestCount$.subscribe(count => {
      this.queuedRequestCount = count;
      this.queuedItems = this.helpRequestService.getQueuedRequests();
    });

    this.helpRequestService.syncCompleted$.subscribe(result => {
      this.successMessage = `Successfully synced ${result.syncedCount} offline request(s) with AidLinkX relief responders!`;
    });
  }

  @HostListener('window:online')
  onOnline(): void {
    this.isOnline = true;
    this.successMessage = 'Network connection restored. Syncing offline emergency requests with relief dispatch...';
    this.helpRequestService.flushQueuedRequests();
  }

  @HostListener('window:offline')
  onOffline(): void {
    this.isOnline = false;
  }

  updateQueueCount(): void {
    this.queuedRequestCount = this.helpRequestService.getQueuedRequestCount();
    this.queuedItems = this.helpRequestService.getQueuedRequests();
  }

  onDisasterTypeChange(): void {
    const val = this.helpRequestForm.get('disasterType')?.value;
    const detailsControl = this.helpRequestForm.get('disasterDetails');

    if (val === 'Other') {
      detailsControl?.setValidators([Validators.required, Validators.minLength(3)]);
    } else {
      detailsControl?.clearValidators();
      detailsControl?.setValue('');
    }
    detailsControl?.updateValueAndValidity();
  }

  toggleSpecialNeed(id: string): void {
    const index = this.selectedSpecialNeeds.indexOf(id);
    if (index >= 0) {
      this.selectedSpecialNeeds.splice(index, 1);
    } else {
      this.selectedSpecialNeeds.push(id);
    }
  }

  isSpecialNeedSelected(id: string): boolean {
    return this.selectedSpecialNeeds.includes(id);
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Please choose a valid image file (JPG, PNG, WebP).';
      input.value = '';
      return;
    }

    if (file.size > 1_600_000) {
      this.errorMessage = 'Photo must be smaller than 1.5 MB for rapid mobile transmission and offline caching.';
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.photoData = String(reader.result);
      this.photoName = file.name;
      this.errorMessage = '';
    };
    reader.readAsDataURL(file);
  }

  removePhoto(): void {
    this.photoData = '';
    this.photoName = '';
  }

  retryQueuedRequests(): void {
    if (!this.isOnline) {
      this.successMessage = 'Your requests remain safely stored on this device and will transmit once connected.';
      return;
    }
    this.successMessage = 'Attempting to transmit queued requests to AidLinkX dispatch now...';
    this.helpRequestService.flushQueuedRequests();
  }

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.requestId = null;
    this.lastClientRequestId = '';

    if (this.helpRequestForm.invalid) {
      this.helpRequestForm.markAllAsTouched();
      this.errorMessage = 'Please fill in all highlighted emergency fields before submitting.';
      return;
    }

    const formVal = this.helpRequestForm.value;
    const clientRequestId = this.createClientRequestId();
    const specialNeedsText = this.selectedSpecialNeeds.length > 0
      ? this.selectedSpecialNeeds
          .map(id => this.specialNeedsOptions.find(opt => opt.id === id)?.label)
          .filter(Boolean)
          .join(', ')
      : undefined;

    const request: HelpRequestCreateRequest = {
      clientRequestId,
      name: formVal.name.trim(),
      contactPhone: formVal.contactPhone.trim(),
      alternateContact: formVal.alternateContact?.trim() || undefined,
      location: formVal.location.trim(),
      landmark: formVal.landmark?.trim() || undefined,
      peopleCount: Number(formVal.peopleCount),
      helpType: formVal.helpType,
      priority: formVal.priority,
      disasterType: formVal.disasterType === 'Other' ? 'OTHER' : formVal.disasterType,
      disasterDetails: formVal.disasterDetails?.trim() || undefined,
      specialNeeds: specialNeedsText,
      description: formVal.description.trim(),
      photoData: this.photoData || undefined
    };

    if (!navigator.onLine) {
      this.saveRequestOffline(
        request,
        `Offline mode active: Help request safely saved on your device (Client ID: ${clientRequestId.slice(0, 8)}). It will be sent automatically when your internet connection returns.`
      );
      return;
    }

    this.isSubmitting = true;
    this.helpRequestService.createHelpRequest(request).subscribe({
      next: (response: HelpRequestResponse) => {
        this.isSubmitting = false;
        this.requestId = response.id;
        this.lastClientRequestId = clientRequestId;
        this.successMessage = `Emergency help request submitted successfully! Relief coordinators have been alerted with reference #${response.id}.`;
        this.resetHelpForm();
      },
      error: (error) => {
        if (this.isConnectivityFailure(error)) {
          this.saveRequestOffline(
            request,
            `Network unreachable: Your request is safely queued on this device (ID: ${clientRequestId.slice(0, 8)}) and will automatically synchronize with responders as soon as connection is available.`
          );
        } else {
          this.isSubmitting = false;
          this.errorMessage = error?.error?.message || 'Unable to submit request right now. Saved a local copy just in case.';
          this.helpRequestService.queueRequest(request);
          this.updateQueueCount();
        }
      }
    });
  }

  openAuthPanel(mode: 'login' | 'register' = 'register'): void {
    this.authMode = mode;
    this.authErrorMessage = '';
    this.showAuthPanel = true;
  }

  setAuthMode(mode: 'login' | 'register'): void {
    this.authMode = mode;
    this.authErrorMessage = '';
    this.authForm.reset();
  }

  onAuthSubmit(): void {
    this.authErrorMessage = '';
    const formVal = this.authForm.value;

    if (this.authMode === 'register') {
      if (!formVal.name || (!formVal.email && !formVal.phone) || this.authForm.get('password')?.invalid) {
        this.authForm.markAllAsTouched();
        this.authErrorMessage = 'Please enter your name, password, and at least an email address or mobile phone.';
        return;
      }
      this.isAuthSubmitting = true;
      this.authService.register({
        name: formVal.name.trim(),
        email: formVal.email?.trim() || undefined,
        phone: formVal.phone?.trim() || undefined,
        password: formVal.password
      }).subscribe({
        next: (resp) => this.completeAuthentication(resp.user),
        error: (err) => this.handleAuthError(err)
      });
      return;
    }

    if (!formVal.identifier || this.authForm.get('password')?.invalid) {
      this.authForm.markAllAsTouched();
      this.authErrorMessage = 'Please enter your email or phone number and your password.';
      return;
    }

    this.isAuthSubmitting = true;
    this.authService.login(formVal.identifier.trim(), formVal.password).subscribe({
      next: (resp) => this.completeAuthentication(resp.user),
      error: (err) => this.handleAuthError(err)
    });
  }

  logout(): void {
    this.authService.logout();
    this.currentUser = null;
    this.successMessage = 'You have signed out. You can continue submitting emergency requests as a guest without any account.';
  }

  copyEmergencyNumber(num: string): void {
    navigator.clipboard?.writeText(num);
    this.copiedNumber = num;
    setTimeout(() => {
      if (this.copiedNumber === num) this.copiedNumber = '';
    }, 2000);
  }

  private completeAuthentication(user: AuthUser): void {
    this.currentUser = user;
    this.showAuthPanel = false;
    this.isAuthSubmitting = false;
    this.successMessage = `Signed in as ${user.name}. You can submit and track your relief requests.`;
    if (!this.helpRequestForm.get('name')?.value) {
      this.helpRequestForm.patchValue({ name: user.name });
    }
    if (user.phone && !this.helpRequestForm.get('contactPhone')?.value) {
      this.helpRequestForm.patchValue({ contactPhone: user.phone });
    }
  }

  private handleAuthError(error: any): void {
    this.isAuthSubmitting = false;
    this.authErrorMessage = error?.error?.message || 'Authentication failed. Please check credentials or register a new account.';
  }

  private saveRequestOffline(request: HelpRequestCreateRequest, message: string): void {
    this.helpRequestService.queueRequest(request);
    this.updateQueueCount();
    this.successMessage = message;
    this.isSubmitting = false;
    this.resetHelpForm();
  }

  private resetHelpForm(): void {
    this.helpRequestForm.reset({
      name: this.currentUser?.name || '',
      contactPhone: this.currentUser?.phone || '',
      peopleCount: 1,
      priority: 'HIGH',
      disasterType: 'Flood / Inundation'
    });
    this.selectedSpecialNeeds = [];
    this.removePhoto();
    this.onDisasterTypeChange();
  }

  private isConnectivityFailure(error: any): boolean {
    return !navigator.onLine || error?.status === 0 || error?.name === 'TimeoutError';
  }

  private createClientRequestId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `aid-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
