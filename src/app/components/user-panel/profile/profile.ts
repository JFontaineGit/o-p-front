import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { UserMe } from '../../../services/interfaces/user.interfaces';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Profile {
  @Input({ required: true }) user?: UserMe | null;
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
      this.cdr.markForCheck();
    }
  }

  getAvatarUrl(): string {
    // UserMe no tiene avatar, así que usamos un placeholder
    return '/placeholder.svg?height=120&width=120';
  }

  getFullName(): string {
    if (!this.user) {
      return '';
    }
    return `${this.user.first_name} ${this.user.last_name}`;
  }

  getInitials(): string {
    if (!this.user) {
      return '';
    }
    const firstInitial = this.user.first_name?.charAt(0).toUpperCase() || '';
    const lastInitial = this.user.last_name?.charAt(0).toUpperCase() || '';
    return `${firstInitial}${lastInitial}`;
  }
}