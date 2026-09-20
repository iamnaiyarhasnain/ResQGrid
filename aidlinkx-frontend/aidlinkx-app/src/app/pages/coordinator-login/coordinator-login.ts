import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, UserRole } from '../../services/auth.service';

type CoordinatorLevel = 'NATIONAL' | 'DISTRICT' | 'FIELD';

@Component({
  selector: 'app-coordinator-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './coordinator-login.html',
  styleUrl: './coordinator-login.css'
})
export class CoordinatorLogin {
  loginForm: FormGroup;
  selectedLevel: CoordinatorLevel = 'DISTRICT';
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  readonly levels: {
    value: CoordinatorLevel;
    role: UserRole;
    title: string;
    detail: string;
    demoEmail: string;
    initials: string;
  }[] = [
    {
      value: 'NATIONAL',
      role: 'NATIONAL_COORDINATOR',
      title: 'National Coordinator',
      detail: 'Strategic oversight across relief regions and states',
      demoEmail: 'national@aidlinkx.demo',
      initials: 'N'
    },
    {
      value: 'DISTRICT',
      role: 'DISTRICT_COORDINATOR',
      title: 'District Coordinator',
      detail: 'Dispatch field teams and balance regional camp supplies',
      demoEmail: 'district@aidlinkx.demo',
      initials: 'D'
    },
    {
      value: 'FIELD',
      role: 'FIELD_COORDINATOR',
      title: 'Field Coordinator',
      detail: 'Verify ground reports and mark relief delivery',
      demoEmail: 'field@aidlinkx.demo',
      initials: 'F'
    }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.formBuilder.group({
      identifier: ['district@aidlinkx.demo', [Validators.required, Validators.minLength(3)]],
      password: ['AidLinkX@2026', [Validators.required, Validators.minLength(4)]],
      level: [this.selectedLevel, Validators.required]
    });
  }

  selectLevel(level: CoordinatorLevel): void {
    this.selectedLevel = level;
    this.loginForm.patchValue({ level });
    const selected = this.levels.find(l => l.value === level);
    if (selected) {
      this.loginForm.patchValue({
        identifier: selected.demoEmail,
        password: 'AidLinkX@2026'
      });
    }
  }

  quickDemoLogin(level: CoordinatorLevel): void {
    this.selectLevel(level);
    this.onSubmit();
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { identifier, password, level } = this.loginForm.value;
    const selected = this.levels.find(l => l.value === level);

    this.isLoading = true;
    localStorage.setItem('aidlinkxCoordinatorLevel', level);
    localStorage.setItem('resqgridCoordinatorLevel', level);

    this.authService.login(identifier.trim(), password, selected?.role).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/coordinator']);
      },
      error: (err) => {
        this.isLoading = false;
        // If live ECS backend demo user needs legacy credentials or is offline, provide graceful bypass for hackathon
        console.warn('Backend auth returned error:', err);
        if (err?.status === 0 || err?.status === 404 || err?.status === 502 || err?.status === 503) {
          // Network issue reaching ECS or demo offline
          this.errorMessage = 'Backend endpoint unreachable. Proceeding in offline evaluation mode...';
          setTimeout(() => this.router.navigate(['/coordinator']), 1000);
        } else {
          this.errorMessage = err?.error?.message || 'Invalid coordinator credentials. Use the 1-Click Quick Demo accounts below.';
        }
      }
    });
  }
}
