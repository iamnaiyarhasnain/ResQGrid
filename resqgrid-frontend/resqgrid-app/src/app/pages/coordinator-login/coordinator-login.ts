import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService, UserRole } from '../../services/auth.service';

type CoordinatorLevel = 'NATIONAL' | 'DISTRICT' | 'FIELD';

export interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  hasLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

@Component({
  selector: 'app-coordinator-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './coordinator-login.html',
  styleUrl: './coordinator-login.css'
})
export class CoordinatorLogin implements OnInit, OnDestroy {
  loginForm: FormGroup;
  selectedLevel: CoordinatorLevel = 'DISTRICT';
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  accessNotice = '';
  returnUrl = '/coordinator';

  // Brute-force cooldown protection
  failedAttempts = 0;
  cooldownSeconds = 0;
  private cooldownTimer: any = null;

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
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.loginForm = this.formBuilder.group({
      identifier: ['district@aidlinkx.demo', [Validators.required, Validators.minLength(3)]],
      password: ['AidLinkX@2026', [Validators.required, Validators.minLength(6)]],
      securityKey: ['AIDLINK-SEC-2026', [Validators.required, Validators.minLength(4)]],
      level: [this.selectedLevel, Validators.required]
    });
  }

  ngOnInit(): void {
    const returnUrlParam = this.route.snapshot.queryParams['returnUrl'];
    if (returnUrlParam) {
      this.returnUrl = returnUrlParam;
    }
    const reason = this.route.snapshot.queryParams['reason'];
    if (reason === 'insufficient_privileges') {
      this.accessNotice = 'Access Restricted: You must authenticate with an authorized Coordinator credential to access this operations console.';
    } else if (reason === 'unauthorized') {
      this.accessNotice = 'Authentication Required: Please sign in with your Coordinator security credentials.';
    }
  }

  ngOnDestroy(): void {
    if (this.cooldownTimer) {
      clearInterval(this.cooldownTimer);
    }
  }

  get passwordStrength(): PasswordStrength {
    const pass = this.loginForm.get('password')?.value || '';
    const hasLength = pass.length >= 8;
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[^A-Za-z0-9]/.test(pass);

    let score = 0;
    if (hasLength) score++;
    if (hasUpper) score++;
    if (hasLower) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;

    let label = 'Weak';
    let color = 'bg-red-500 text-red-700';
    if (score >= 4) {
      label = 'Strong (Field Grade)';
      color = 'bg-emerald-500 text-emerald-700';
    } else if (score >= 3) {
      label = 'Moderate';
      color = 'bg-amber-500 text-amber-700';
    }

    return { score, label, color, hasLength, hasUpper, hasLower, hasNumber, hasSpecial };
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  selectLevel(level: CoordinatorLevel): void {
    this.selectedLevel = level;
    this.loginForm.patchValue({ level });
    const selected = this.levels.find(l => l.value === level);
    if (selected) {
      this.loginForm.patchValue({
        identifier: selected.demoEmail,
        password: 'AidLinkX@2026',
        securityKey: 'AIDLINK-SEC-2026'
      });
    }
  }

  quickDemoLogin(level: CoordinatorLevel): void {
    this.selectLevel(level);
    this.onSubmit();
  }

  onSubmit(): void {
    if (this.cooldownSeconds > 0) {
      return;
    }

    this.errorMessage = '';
    this.accessNotice = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { identifier, password, securityKey, level } = this.loginForm.value;
    const selected = this.levels.find(l => l.value === level);

    this.isLoading = true;
    localStorage.setItem('aidlinkxCoordinatorLevel', level);
    localStorage.setItem('resqgridCoordinatorLevel', level);

    this.authService.login(identifier.trim(), password, selected?.role, securityKey?.trim()).subscribe({
      next: () => {
        this.isLoading = false;
        this.failedAttempts = 0;
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.isLoading = false;
        this.failedAttempts++;

        console.warn('Backend auth returned error:', err);
        if (err?.status === 0 || err?.status === 404 || err?.status === 502 || err?.status === 503) {
          this.errorMessage = 'Backend endpoint temporarily offline. Launching fallback command console...';
          setTimeout(() => this.router.navigateByUrl(this.returnUrl), 1000);
        } else {
          this.errorMessage = err?.error?.message || 'Invalid coordinator credentials or clearance key. Verify your security clearance code.';
          
          // Client-side brute-force defense: if 3 or more failed attempts, start a 30s cooldown
          if (this.failedAttempts >= 3) {
            this.startCooldown(30);
          }
        }
      }
    });
  }

  private startCooldown(seconds: number): void {
    this.cooldownSeconds = seconds;
    if (this.cooldownTimer) clearInterval(this.cooldownTimer);
    this.cooldownTimer = setInterval(() => {
      this.cooldownSeconds--;
      if (this.cooldownSeconds <= 0) {
        clearInterval(this.cooldownTimer);
        this.cooldownTimer = null;
      }
    }, 1000);
  }
}
