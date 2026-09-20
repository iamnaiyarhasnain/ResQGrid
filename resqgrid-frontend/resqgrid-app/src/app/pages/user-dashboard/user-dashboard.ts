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
import { ThemeService } from '../../services/theme.service';

export interface EmergencyContact {
  name: string;
  number: string;
  category: string;
  badgeColor: string;
  iconType: 'police' | 'medical' | 'fire' | 'disaster' | 'dispatch';
}

export interface DisasterZone {
  id: string;
  title: string;
  region: string;
  disasterType: string;
  imageUrl: string;
  status: string;
  description: string;
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
  showTermsModal = false;
  showPrivacyModal = false;
  authMode: 'login' | 'register' = 'register';
  currentUser: AuthUser | null = null;
  photoData = '';
  photoName = '';
  copiedNumber = '';
  isDetectingLocation = false;

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
      category: 'Police & Combined Rescue',
      badgeColor: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900',
      iconType: 'police'
    },
    {
      name: 'Ambulance & Trauma Care',
      number: '108',
      category: 'Medical Evacuation & Paramedics',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
      iconType: 'medical'
    },
    {
      name: 'Fire & Rescue Service',
      number: '101',
      category: 'Fire Extinction & Collapse Rescue',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
      iconType: 'fire'
    },
    {
      name: 'State Disaster Response (SDMA/NDMA)',
      number: '1070',
      category: 'Disaster Coordination HQ',
      badgeColor: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900',
      iconType: 'disaster'
    },
    {
      name: 'AidLinkX 24/7 Rapid Dispatch',
      number: '+91 800 233 5465',
      category: 'Humanitarian Operations Desk',
      badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900',
      iconType: 'dispatch'
    }
  ];

  readonly disasterZones: DisasterZone[] = [
    {
      id: 'bihar-flood',
      title: 'Bihar River Basin Inundation',
      region: 'Kosi & Ganga River Basins, Bihar',
      disasterType: 'Flood / Inundation',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/NDRF_in_Bihar_Flood.jpg/800px-NDRF_in_Bihar_Flood.jpg',
      status: 'High Alert',
      description: 'Severe seasonal waterlogging and embankment overflow. NDRF water rescue units active.'
    },
    {
      id: 'kerala-landslide',
      title: 'Wayanad Mountain Landslide',
      region: 'Western Ghats, Wayanad, Kerala',
      disasterType: 'Landslide / Mudflow',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Wayanad_landslide.jpg/800px-Wayanad_landslide.jpg',
      status: 'Critical Relief Zone',
      description: 'Heavy torrential precipitation causing slope collapse and debris flow across access corridors.'
    },
    {
      id: 'coastal-cyclone',
      title: 'Bay of Bengal Cyclonic System',
      region: 'Odisha & Coastal Andhra Pradesh',
      disasterType: 'Cyclone / Severe Storm',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Cyclone_Fani_approaching_India.jpg/800px-Cyclone_Fani_approaching_India.jpg',
      status: 'Storm Warning',
      description: 'High-velocity gusts and storm surge warnings. Evacuation shelter grid active across low-lying districts.'
    },
    {
      id: 'kerala-monsoon',
      title: 'Monsoon Urban Flash Flooding',
      region: 'Ernakulam & Thrissur, Kerala',
      disasterType: 'Cloudburst / Flash Flood',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Flooded-home-companypady-2018-kerala-floods.jpg/800px-Flooded-home-companypady-2018-kerala-floods.jpg',
      status: 'Active Evacuation',
      description: 'Intense precipitation causing river backflow into residential colonies and transportation cut-offs.'
    }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private helpRequestService: HelpRequestService,
    private authService: AuthService,
    public themeService: ThemeService
  ) {
    this.currentUser = this.authService.currentUser;

    this.helpRequestForm = this.formBuilder.group({
      name: [this.currentUser?.name || '', [Validators.required, Validators.minLength(2)]],
      contactPhone: [this.currentUser?.phone || '', [Validators.required, Validators.pattern(/^[0-9+ -]{7,16}$/)]],
      alternateContact: ['', [Validators.pattern(/^[0-9+ -]{7,16}$/)]],
      location: ['', [Validators.required, Validators.minLength(3)]],
      landmark: [''],
      peopleCount: [1, [Validators.required, Validators.min(1), Validators.max(5000)]],
      priority: ['HIGH', Validators.required],
      disasterType: ['Flood / Inundation', Validators.required],
      disasterTypeOther: [''],
      details: ['']
    });

    this.authForm = this.formBuilder.group({
      name: [''],
      identifier: ['', [Validators.required]],
      phone: ['', [Validators.pattern(/^[0-9+ -]{7,16}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.queuedRequestCount = this.helpRequestService.getQueuedRequestCount();
    this.queuedItems = this.helpRequestService.getQueuedRequests();

    this.helpRequestService.queuedRequestCount$.subscribe((count) => {
      this.queuedRequestCount = count;
      this.queuedItems = this.helpRequestService.getQueuedRequests();
    });

    this.helpRequestService.syncCompleted$.subscribe(({ syncedCount }) => {
      if (syncedCount > 0) {
        this.successMessage = `Successfully synced ${syncedCount} queued emergency request(s) to dispatch headquarters.`;
        setTimeout(() => (this.successMessage = ''), 7000);
      }
    });

    this.currentUser = this.authService.currentUser;
    if (this.currentUser) {
      if (!this.helpRequestForm.get('name')?.value) {
        this.helpRequestForm.patchValue({ name: this.currentUser.name });
      }
      if (!this.helpRequestForm.get('contactPhone')?.value && this.currentUser.phone) {
        this.helpRequestForm.patchValue({ contactPhone: this.currentUser.phone });
      }
    }
  }

  @HostListener('window:online')
  onNetworkOnline(): void {
    this.isOnline = true;
  }

  @HostListener('window:offline')
  onNetworkOffline(): void {
    this.isOnline = false;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  selectDisasterZone(zone: DisasterZone): void {
    this.helpRequestForm.patchValue({
      disasterType: zone.disasterType,
      location: zone.region,
      landmark: zone.title
    });
    // Scroll smoothly to form
    const formElement = document.getElementById('aid-request-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  detectGPS(): void {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    this.isDetectingLocation = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.isDetectingLocation = false;
        const lat = position.coords.latitude.toFixed(5);
        const lng = position.coords.longitude.toFixed(5);
        const existingLocation = this.helpRequestForm.get('location')?.value;
        const coordsText = `GPS: ${lat}, ${lng}`;
        this.helpRequestForm.patchValue({
          location: existingLocation ? `${existingLocation} (${coordsText})` : coordsText
        });
      },
      (err) => {
        this.isDetectingLocation = false;
        console.warn('Geolocation error:', err);
        alert('Could not retrieve GPS coordinates. Please type your location manually.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  toggleSpecialNeed(id: string): void {
    if (this.selectedSpecialNeeds.includes(id)) {
      this.selectedSpecialNeeds = this.selectedSpecialNeeds.filter((item) => item !== id);
    } else {
      this.selectedSpecialNeeds.push(id);
    }
  }

  isSpecialNeedSelected(id: string): boolean {
    return this.selectedSpecialNeeds.includes(id);
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert('Photo must be less than 5MB.');
        return;
      }
      this.photoName = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        this.photoData = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto(): void {
    this.photoData = '';
    this.photoName = '';
  }

  copyEmergencyNumber(number: string): void {
    navigator.clipboard.writeText(number).then(() => {
      this.copiedNumber = number;
      setTimeout(() => (this.copiedNumber = ''), 2500);
    });
  }

  triggerManualSync(): void {
    this.helpRequestService.flushQueuedRequests();
  }

  openAuthPanel(mode: 'login' | 'register'): void {
    this.authMode = mode;
    this.authErrorMessage = '';
    this.showAuthPanel = true;
  }

  closeAuthPanel(): void {
    this.showAuthPanel = false;
  }

  switchAuthMode(mode: 'login' | 'register'): void {
    this.authMode = mode;
    this.authErrorMessage = '';
  }

  submitAuth(): void {
    this.authErrorMessage = '';
    if (this.authMode === 'login') {
      const { identifier, password } = this.authForm.value;
      if (!identifier || !password) {
        this.authErrorMessage = 'Please enter your email/phone and password.';
        return;
      }
      this.isAuthSubmitting = true;
      this.authService.login(identifier.trim(), password).subscribe({
        next: (res) => {
          this.isAuthSubmitting = false;
          this.currentUser = res.user;
          this.showAuthPanel = false;
        },
        error: (err) => {
          this.isAuthSubmitting = false;
          this.authErrorMessage = err?.error?.message || 'Invalid credentials. Please try again.';
        }
      });
    } else {
      const { name, identifier, phone, password } = this.authForm.value;
      if (!identifier || !password) {
        this.authErrorMessage = 'Please fill in required fields.';
        return;
      }
      this.isAuthSubmitting = true;
      const isEmail = identifier.includes('@');
      this.authService.register({
        name: name?.trim() || identifier.split('@')[0],
        email: isEmail ? identifier.trim() : undefined,
        phone: !isEmail ? identifier.trim() : (phone?.trim() || undefined),
        password: password
      }).subscribe({
        next: (res) => {
          this.isAuthSubmitting = false;
          this.currentUser = res.user;
          this.showAuthPanel = false;
        },
        error: (err) => {
          this.isAuthSubmitting = false;
          this.authErrorMessage = err?.error?.message || 'Registration failed. Try signing in directly.';
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.currentUser = null;
  }

  submitHelpRequest(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.helpRequestForm.invalid) {
      this.helpRequestForm.markAllAsTouched();
      this.errorMessage = 'Please complete all required fields marked in red.';
      return;
    }

    const val = this.helpRequestForm.value;
    const finalDisasterType = val.disasterType === 'Other' && val.disasterTypeOther?.trim()
      ? `Other: ${val.disasterTypeOther.trim()}`
      : val.disasterType;

    const requestPayload: HelpRequestCreateRequest = {
      name: val.name.trim(),
      contactPhone: val.contactPhone?.trim(),
      alternateContact: val.alternateContact?.trim() || undefined,
      location: val.location.trim(),
      landmark: val.landmark?.trim() || undefined,
      peopleCount: Number(val.peopleCount) || 1,
      helpType: 'RESCUE_AND_SUPPLIES',
      priority: val.priority,
      disasterType: finalDisasterType,
      specialNeeds: this.selectedSpecialNeeds.length > 0 ? this.selectedSpecialNeeds.join(', ') : undefined,
      description: val.details?.trim() || `Emergency assistance requested for ${finalDisasterType}`,
      photoData: this.photoData || undefined,
      clientRequestId: this.lastClientRequestId || this.generateClientRequestId()
    };

    this.isSubmitting = true;

    if (!navigator.onLine) {
      this.helpRequestService.queueRequest(requestPayload);
      this.isSubmitting = false;
      this.requestId = null;
      this.successMessage = 'Offline: Your emergency request is stored locally and will automatically transmit upon connection.';
      this.helpRequestForm.reset({
        name: this.currentUser?.name || '',
        contactPhone: this.currentUser?.phone || '',
        alternateContact: '',
        location: '',
        landmark: '',
        peopleCount: 1,
        priority: 'HIGH',
        disasterType: 'Flood / Inundation',
        disasterTypeOther: '',
        details: ''
      });
      this.selectedSpecialNeeds = [];
      this.photoData = '';
      this.photoName = '';
      return;
    }

    this.helpRequestService.createHelpRequest(requestPayload).subscribe({
      next: (res: HelpRequestResponse) => {
        this.isSubmitting = false;
        this.requestId = res.id;
        this.successMessage = `Emergency dispatch ID #${res.id} generated! Response teams have been notified.`;
        this.helpRequestForm.reset({
          name: this.currentUser?.name || '',
          contactPhone: this.currentUser?.phone || '',
          alternateContact: '',
          location: '',
          landmark: '',
          peopleCount: 1,
          priority: 'HIGH',
          disasterType: 'Flood / Inundation',
          disasterTypeOther: '',
          details: ''
        });
        this.selectedSpecialNeeds = [];
        this.photoData = '';
        this.photoName = '';
        this.lastClientRequestId = '';
      },
      error: (err) => {
        this.isSubmitting = false;
        console.warn('Live submit failed, queueing offline:', err);
        this.helpRequestService.queueRequest(requestPayload);
        this.successMessage = 'Network interruption detected. Your emergency request has been safely queued and will sync automatically.';
      }
    });
  }

  private generateClientRequestId(): string {
    const rand = Math.random().toString(36).substring(2, 10);
    this.lastClientRequestId = `hr-${Date.now()}-${rand}`;
    return this.lastClientRequestId;
  }
}
