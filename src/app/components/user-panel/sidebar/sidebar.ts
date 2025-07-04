import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Profile } from '../profile/profile';
import { User, UserPanelTab, TabItem } from '../interfaces/user-panel.interfaces';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, Profile],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Sidebar {
  
  @Input({ required: true }) user!: User;
  @Input({ required: true }) tabs: TabItem[] = [];
  @Input({ required: true }) activeTab!: UserPanelTab;
  @Input() showStats = true;
  @Input() allowAvatarEdit = true;
  
  @Output() tabChange = new EventEmitter<UserPanelTab>();
  @Output() avatarChange = new EventEmitter<File>();

  /**
   * Maneja el cambio de tab
   */
  onTabChange(tabId: UserPanelTab): void {
    if (this.activeTab !== tabId) {
      this.tabChange.emit(tabId);
    }
  }

  /**
   * Maneja el cambio de avatar
   */
  onAvatarChange(file: File): void {
    this.avatarChange.emit(file);
  }

  /**
   * Verifica si un tab está activo
   */
  isTabActive(tabId: UserPanelTab): boolean {
    return this.activeTab === tabId;
  }

  /**
   * Obtiene las clases CSS para un elemento de navegación
   */
  getNavItemClasses(tabId: UserPanelTab): Record<string, boolean> {
    return {
      'sidebar-nav__item': true,
      'sidebar-nav__item--active': this.isTabActive(tabId)
    };
  }

  /**
   * Función de tracking para optimizar *ngFor
   */
  trackByTabId(index: number, item: TabItem): UserPanelTab {
    return item.id;
  }
}