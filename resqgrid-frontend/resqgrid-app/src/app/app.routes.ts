import { Routes } from '@angular/router';
import { CampWorkerDashboard } from './pages/camp-worker-dashboard/camp-worker-dashboard';
import { CreateRequest } from './pages/create-request/create-request';
import { CoordinatorDashboard } from './pages/coordinator-dashboard/coordinator-dashboard';
import { CoordinatorLogin } from './pages/coordinator-login/coordinator-login';
import { UserDashboard } from './pages/user-dashboard/user-dashboard';
import { FeedbackPage } from './pages/feedback/feedback';
import { coordinatorGuard } from './guards/coordinator.guard';

export const routes: Routes = [
  // Resident/User Emergency Help Desk (Landing Page)
  {
    path: 'user',
    component: UserDashboard
  },

  // Feedback and Suggestions
  {
    path: 'feedback',
    component: FeedbackPage
  },

  // Coordinator Dashboard (Protected via Coordinator Security Guard)
  {
    path: 'coordinator',
    component: CoordinatorDashboard,
    canActivate: [coordinatorGuard]
  },

  // Coordinator Sign-in
  {
    path: 'coordinator-login',
    component: CoordinatorLogin
  },

  // Camp Worker Dashboard
  {
    path: 'camp-worker',
    component: CampWorkerDashboard
  },

  // Camp Worker Creates Supply Request
  {
    path: 'create-request',
    component: CreateRequest
  },

  // Default redirect to Resident emergency desk
  {
    path: '',
    redirectTo: 'user',
    pathMatch: 'full'
  },

  // Catch-all
  {
    path: '**',
    redirectTo: 'user'
  }
];
