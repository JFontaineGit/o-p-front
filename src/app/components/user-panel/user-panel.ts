import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from './sidebar/sidebar';
import { ProfileForm } from './profile-form/profile-form';
import { Bookings } from './bookings/bookings';
import { Favorites } from './favorites/favorites';
import { Booking, Favorite, TabItem, UserPanelTab, UserPanelConfig } from './interfaces/user-panel.interfaces';
import { UserMe } from '../../services/interfaces/user.interfaces';
import { UserService } from '../../services/users/user.service' 
import { AuthService } from '../../services/auth/auth.service'; 
import { Observable, of, Subject } from 'rxjs';
import { takeUntil, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    Sidebar,
    ProfileForm,
    Bookings,
    Favorites
  ],
  templateUrl: './user-panel.html',
  styleUrls: ['./user-panel.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserPanel implements OnInit {
  // Inputs & Outputs
  @Input() bookings: Booking[] = [];
  @Input() favorites: Favorite[] = [];
  @Input() config: UserPanelConfig = {
    showStats: true,
    allowAvatarEdit: true,
    enableNotifications: true
  };
  @Input() isLoading = false;

  @Output() userUpdated = new EventEmitter<UserMe>();
  @Output() tabChanged = new EventEmitter<UserPanelTab>();
  @Output() avatarChanged = new EventEmitter<File>();
  @Output() bookingAction = new EventEmitter<{action: string, bookingId: string}>();
  @Output() favoriteRemoved = new EventEmitter<string>();
  @Output() favoriteClicked = new EventEmitter<Favorite>();

  // Propiedades públicas
  user: UserMe | null = null;
  activeTab: UserPanelTab = 'personal';
  error: string | null = null;

  tabs: TabItem[] = [
    { id: 'personal' as UserPanelTab, label: 'Información Personal', icon: 'fas fa-user', active: true },
    { id: 'bookings' as UserPanelTab, label: 'Mis Reservas', icon: 'fas fa-suitcase', active: false },
    { id: 'favorites' as UserPanelTab, label: 'Favoritos', icon: 'fas fa-heart', active: false },
    { id: 'payments' as UserPanelTab, label: 'Métodos de Pago', icon: 'fas fa-credit-card', active: false },
    { id: 'security' as UserPanelTab, label: 'Seguridad', icon: 'fas fa-shield-alt', active: false },
    { id: 'notifications' as UserPanelTab, label: 'Notificaciones', icon: 'fas fa-bell', active: false }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.userService.getMe().pipe(
      takeUntil(this.destroy$),
      tap(() => this.isLoading = true),
      catchError(error => {
        this.error = 'Error al cargar los datos del usuario';
        this.isLoading = false;
        this.cdr.markForCheck();
        this.router.navigate(['/login']);
        return of(null);
      })
    ).subscribe(user => {
      this.isLoading = false;
      this.user = user ? { ...user } : null;
      if (!this.user) {
        this.error = 'No se encontraron datos del usuario';
        this.router.navigate(['/login']);
      } else {
        this.loadBookingsAndFavorites(this.user.id); 
      }
      this.updateTabStates();
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Métodos públicos - Navegación
  onTabChange(tabId: UserPanelTab): void {
    if (this.activeTab !== tabId) {
      this.activeTab = tabId;
      this.updateTabStates();
      this.tabChanged.emit(tabId);
      this.cdr.markForCheck();
    }
  }

  isTabActive(tabId: UserPanelTab): boolean {
    return this.activeTab === tabId;
  }

  // Métodos públicos - Eventos de usuario
  onUserUpdate(updatedUser: UserMe): void {
    this.user = updatedUser;
    this.userUpdated.emit(updatedUser);
    this.cdr.markForCheck();
  }

  onAvatarChange(file: File): void {
    this.avatarChanged.emit(file);
  }

  // Métodos públicos - Eventos de reservas
  onBookingAction(event: {action: string, bookingId: string}): void {
    this.bookingAction.emit(event);
  }

  // Métodos públicos - Eventos de favoritos
  onFavoriteRemove(favoriteId: string): void {
    this.favoriteRemoved.emit(favoriteId);
  }

  onFavoriteClick(favorite: Favorite): void {
    this.favoriteClicked.emit(favorite);
  }

  // Métodos privados
  private updateTabStates(): void {
    this.tabs = this.tabs.map(tab => ({
      ...tab,
      active: tab.id === this.activeTab
    }));
  }

  getActiveTabTitle(): string {
    const activeTabItem = this.tabs.find(tab => tab.id === this.activeTab);
    return activeTabItem?.label || 'Panel de Usuario';
  }

  getDashboardStats() {
    return {
      totalBookings: this.bookings.length,
      upcomingBookings: this.bookings.filter(b => b.status === 'confirmed').length,
      completedBookings: this.bookings.filter(b => b.status === 'completed').length,
      totalFavorites: this.favorites.length
    };
  }

  private loadBookingsAndFavorites(userId: number): void {
    // Aquí implementarías la lógica para cargar reservas y favoritos
    // Por ahora, mantenemos los datos mockeados como estaban, pero podrías reemplazarlos con un servicio real
    this.bookings = [
      {
        id: '1',
        title: 'Viaje a Paris',
        destination: 'Paris, France',
        startDate: '2025-08-01',
        endDate: '2025-08-07',
        guests: 2,
        price: 1500,
        status: 'confirmed',
        imageUrl: 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
      },
      {
        id: '2',
        title: 'Viaje a Tokyo',
        destination: 'Tokyo, Japan',
        startDate: '2025-06-01',
        endDate: '2025-06-10',
        guests: 1,
        price: 2000,
        status: 'completed',
        imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
      }
    ];
    this.favorites = [
      { id: 'f1', title: 'Rome', description: 'City tour', price: 800, imageUrl: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' }
    ];
    this.cdr.markForCheck();
  }
}