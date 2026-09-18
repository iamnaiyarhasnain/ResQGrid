import { Component } from '@angular/core';

// RouterLink allows us to navigate to another
// page when a button or link is clicked.
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-camp-worker-dashboard',

  // Make RouterLink available inside our HTML.
  imports: [RouterLink],

  templateUrl: './camp-worker-dashboard.html',
  styleUrl: './camp-worker-dashboard.css'
})
export class CampWorkerDashboard {
}
