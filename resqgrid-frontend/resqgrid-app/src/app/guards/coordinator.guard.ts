import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const coordinatorGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isSignedIn && authService.isCoordinator) {
    return true;
  }

  // Not signed in or not a coordinator: redirect to login with returnUrl
  return router.createUrlTree(['/coordinator-login'], {
    queryParams: {
      returnUrl: state.url,
      reason: authService.isSignedIn ? 'insufficient_privileges' : 'unauthorized'
    }
  });
};
