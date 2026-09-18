import { Routes } from '@angular/router';

import { CampWorkerDashboard }
  from './pages/camp-worker-dashboard/camp-worker-dashboard';

import { CreateRequest }
  from './pages/create-request/create-request';

import { CoordinatorDashboard }
  from './pages/coordinator-dashboard/coordinator-dashboard';

import { UserDashboard }
  from './pages/user-dashboard/user-dashboard';


export const routes: Routes = [

  // Camp Worker Dashboard
  {
    path: 'camp-worker',
    component: CampWorkerDashboard
  },

  // Camp Worker creates supply request
  {
    path: 'create-request',
    component: CreateRequest
  },

  // Coordinator Dashboard
  {
    path: 'coordinator',
    component: CoordinatorDashboard
  },

  // Resident/User Dashboard
  {
    path: 'user',
    component: UserDashboard
  },

  // Default page
  {
    path: '',
    redirectTo: 'user',
    pathMatch: 'full'
  }

];