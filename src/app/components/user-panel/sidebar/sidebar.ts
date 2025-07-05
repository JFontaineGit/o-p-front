import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Profile } from '../profile/profile';
import { UserPanelTab, TabItem } from '../interfaces/user-panel.interfaces';
import { UserMe } from '../../../services/interfaces/user.interfaces';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, Profile],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Sidebar {
  @Input({ required: true }) user!: UserMe | null;
  @Input({ required: true }) tabs: TabItem[] = [];
  @Input({ required: true }) activeTab!: UserPanelTab;
  @Input() showStats = true;
  @Input() allowAvatarEdit = true;

  @Output() tabChange = new EventEmitter<UserPanelTab>();
  @Output() avatarChange = new EventEmitter<File>();

  onTabChange(tabId: UserPanelTab): void {
    if (this.activeTab !== tabId) {
      this.tabChange.emit(tabId);
    }
  }

  onAvatarChange(file: File): void {
    this.avatarChange.emit(file);
  }

  isTabActive(tabId: UserPanelTab): boolean {
    return this.activeTab === tabId;
  }

  getNavItemClasses(tabId: UserPanelTab): Record<string, boolean> {
    return {
      'sidebar-nav__item': true,
      'sidebar-nav__item--active': this.isTabActive(tabId)
    };
  }

  trackByTabId(index: number, item: TabItem): UserPanelTab {
    return item.id;
  }
}