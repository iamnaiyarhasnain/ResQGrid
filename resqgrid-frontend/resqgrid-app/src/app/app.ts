import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',

  // RouterOutlet allows Angular routing to work
  // inside the root application component.
  imports: [RouterOutlet],

  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
}