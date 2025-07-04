import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  
  @Input({ required: true }) user!: User;
  @Input() showStats = true;
  @Input() allowAvatarEdit = true;
  
  @Output() avatarChange = new EventEmitter<File>();



  /**
   * Obtiene la URL del avatar o placeholder
   */
  getAvatarUrl(): string {
    return this.user.avatar || '/placeholder.svg?height=120&width=120';
  }

  /**
   * Obtiene el nombre completo del usuario
   */
  getFullName(): string {
    return `${this.user.firstName} ${this.user.lastName}`;
  }
}