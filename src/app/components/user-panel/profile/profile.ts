import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { User } from '../interfaces/user-panel.interfaces';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Profile {
  @Input({ required: true }) user?: User; 
  @Input() showStats = true;
  @Input() allowAvatarEdit = true;
  @Output() avatarChange = new EventEmitter<File>();

  isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnChanges(): void {
    if (this.user) {
      this.cdr.markForCheck(); // Trigger change detection when user input changes
    }
  }

  getAvatarUrl(): string {
    if (!this.user) {
      return '/placeholder.svg?height=120&width=120';
    }
    if (this.isBrowser) {
      return this.user.avatar || '/placeholder.svg?height=120&width=120';
    }
    return '/placeholder.svg?height=120&width=120';
  }

  getFullName(): string {
    if (!this.user) {
      return ''; // Fallback for undefined user
    }
    return `${this.user.firstName} ${this.user.lastName}`;
  }

  getInitials(): string {
    if (!this.user) {
      return ''; // Devuelve vacío si user no está definido
    }
    const firstInitial = this.user.firstName?.charAt(0).toUpperCase() || '';
    const lastInitial = this.user.lastName?.charAt(0).toUpperCase() || '';
    return `${firstInitial}${lastInitial}`;
  }
}