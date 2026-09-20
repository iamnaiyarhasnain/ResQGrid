import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

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

  readonly levels: { value: CoordinatorLevel; title: string; detail: string; initials: string }[] = [
    { value: 'NATIONAL', title: 'National coordinator', detail: 'Oversight across relief regions', initials: 'N' },
    { value: 'DISTRICT', title: 'District coordinator', detail: 'Coordinate camps and local response', initials: 'D' },
    { value: 'FIELD', title: 'Field coordinator', detail: 'Act on requests at the response edge', initials: 'F' }
  ];

  constructor(private formBuilder: FormBuilder, private router: Router) {
    this.loginForm = this.formBuilder.group({
      coordinatorId: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      level: [this.selectedLevel, Validators.required]
    });
  }

  selectLevel(level: CoordinatorLevel): void {
    this.selectedLevel = level;
    this.loginForm.patchValue({ level });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    // No authentication endpoint exists yet; retain level for this demo flow.
    localStorage.setItem('resqgridCoordinatorLevel', this.loginForm.value.level);
    this.router.navigate(['/coordinator']);
  }
}
