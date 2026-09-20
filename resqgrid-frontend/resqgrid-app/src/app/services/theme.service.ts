import { Injectable, signal } from '@angular/core';

export type AppTheme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly storageKey = 'aidlinkx-theme';
  readonly isDark = signal<boolean>(false);

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    const saved = localStorage.getItem(this.storageKey) as AppTheme | null;
    if (saved) {
      this.setTheme(saved === 'dark');
    } else {
      // Default to light mode for crisp and readable crisis response
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDark ? false : false); // Default light
    }
  }

  toggleTheme(): void {
    this.setTheme(!this.isDark());
  }

  setTheme(dark: boolean): void {
    this.isDark.set(dark);
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(this.storageKey, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(this.storageKey, 'light');
    }
  }
}
