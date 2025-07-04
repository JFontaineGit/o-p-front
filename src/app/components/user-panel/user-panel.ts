import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from './sidebar/sidebar';
import { ProfileForm } from './profile-form/profile-form';
import { Bookings } from './bookings/bookings';
import { Favorites } from './favorites/favorites';
import { 
  User, 
  Booking, 
  Favorite, 
  TabItem, 
  UserPanelTab, 
  UserPanelConfig 
} from './interfaces/user-panel.interfaces';

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
  
  // =============================================================================
  // INPUTS & OUTPUTS
  // =============================================================================
  
  @Input({ required: true }) user!: User;
  @Input() bookings: Booking[] = [];
  @Input() favorites: Favorite[] = [];
  @Input() config: UserPanelConfig = {
    showStats: true,
    allowAvatarEdit: true,
    enableNotifications: true
  };
  @Input() isLoading = false;
  
  @Output() userUpdated = new EventEmitter<User>();
  @Output() tabChanged = new EventEmitter<UserPanelTab>();
  @Output() avatarChanged = new EventEmitter<File>();
  @Output() bookingAction = new EventEmitter<{action: string, bookingId: string}>();
  @Output() favoriteRemoved = new EventEmitter<string>();
  @Output() favoriteClicked = new EventEmitter<Favorite>();

  // =============================================================================
  // PROPIEDADES PÚBLICAS
  // =============================================================================
  
  activeTab: UserPanelTab = 'personal';
  
  tabs: TabItem[] = [
    { id: 'personal' as UserPanelTab, label: 'Información Personal', icon: 'fas fa-user', active: true },
    { id: 'bookings' as UserPanelTab, label: 'Mis Reservas', icon: 'fas fa-suitcase', active: false },
    { id: 'favorites' as UserPanelTab, label: 'Favoritos', icon: 'fas fa-heart', active: false },
    { id: 'payments' as UserPanelTab, label: 'Métodos de Pago', icon: 'fas fa-credit-card', active: false },
    { id: 'security' as UserPanelTab, label: 'Seguridad', icon: 'fas fa-shield-alt', active: false },
    { id: 'notifications' as UserPanelTab, label: 'Notificaciones', icon: 'fas fa-bell', active: false }
  ];

  // =============================================================================
  // LIFECYCLE
  // =============================================================================
  
  ngOnInit(): void {
    this.updateTabStates();
    // Simula carga de datos
    this.loadInitialData();
  }

  // =============================================================================
  // MÉTODOS PÚBLICOS - NAVEGACIÓN
  // =============================================================================

  /**
   * Cambia el tab activo
   */
  onTabChange(tabId: UserPanelTab): void {
    if (this.activeTab !== tabId) {
      this.activeTab = tabId;
      this.updateTabStates();
      this.tabChanged.emit(tabId);
    }
  }

  /**
   * Verifica si un tab está activo
   */
  isTabActive(tabId: UserPanelTab): boolean {
    return this.activeTab === tabId;
  }

  // =============================================================================
  // MÉTODOS PÚBLICOS - EVENTOS DE USUARIO
  // =============================================================================

  /**
   * Maneja la actualización del perfil de usuario
   */
  onUserUpdate(updatedUser: User): void {
    this.userUpdated.emit(updatedUser);
  }

  /**
   * Maneja el cambio de avatar
   */
  onAvatarChange(file: File): void {
    this.avatarChanged.emit(file);
  }

  // =============================================================================
  // MÉTODOS PÚBLICOS - EVENTOS DE RESERVAS
  // =============================================================================

  /**
   * Maneja las acciones de reserva
   */
  onBookingAction(event: {action: string, bookingId: string}): void {
    this.bookingAction.emit(event);
  }

  // =============================================================================
  // MÉTODOS PÚBLICOS - EVENTOS DE FAVORITOS
  // =============================================================================

  /**
   * Maneja la eliminación de favoritos
   */
  onFavoriteRemove(favoriteId: string): void {
    this.favoriteRemoved.emit(favoriteId);
  }

  /**
   * Maneja el click en favoritos
   */
  onFavoriteClick(favorite: Favorite): void {
    this.favoriteClicked.emit(favorite);
  }

  // =============================================================================
  // MÉTODOS PRIVADOS
  // =============================================================================

  /**
   * Actualiza el estado activo de los tabs
   */
  private updateTabStates(): void {
    this.tabs = this.tabs.map(tab => ({
      ...tab,
      active: tab.id === this.activeTab
    }));
  }

  /**
   * Obtiene el título del tab activo
   */
  getActiveTabTitle(): string {
    const activeTabItem = this.tabs.find(tab => tab.id === this.activeTab);
    return activeTabItem?.label || 'Panel de Usuario';
  }

  /**
   * Obtiene estadísticas del dashboard
   */
  getDashboardStats() {
    return {
      totalBookings: this.bookings.length,
      upcomingBookings: this.bookings.filter(b => b.status === 'confirmed').length,
      completedBookings: this.bookings.filter(b => b.status === 'completed').length,
      totalFavorites: this.favorites.length
    };
  }

  /**
   * Simula carga de datos iniciales (reemplazar con servicio real)
   */
  private loadInitialData(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.user = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        nationality: 'US',
        address: '123 Main St',
        city: 'New York',
        postalCode: '10001',
        stats: { trips: 5, countries: 3, rating: 4.5 },
        preferences: { travelStyle: 'comfort', accommodation: 'hotel' }
      };
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
          imageUrl: '/paris.jpg'
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
          imageUrl: '/tokyo.jpg'
        }
      ];
      this.favorites = [
        { id: 'f1', title: 'Rome', description: 'City tour', price: 800, imageUrl: '/rome.jpg' }
      ];
      this.isLoading = false;
    }, 1000);
  }
}