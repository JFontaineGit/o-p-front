import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingCard } from '../booking-card/booking-card';
import { Booking, BookingFilter } from '../interfaces/user-panel.interfaces';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, BookingCard],
  templateUrl: './bookings.html',
  styleUrls: ['./bookings.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Bookings implements OnInit, OnChanges {
  @Input({ required: true }) bookings: Booking[] = [];
  @Input() isLoading = false;
  @Output() bookingAction = new EventEmitter<{ action: string, bookingId: string }>();
  @Output() filterChange = new EventEmitter<string>();

  filteredBookings: Booking[] = [];
  activeFilter: BookingFilter['value'] = 'all';

  bookingFilters: BookingFilter[] = [
    { id: 'all', label: 'Todas', value: 'all', active: true },
    { id: 'upcoming', label: 'Próximas', value: 'upcoming', active: false },
    { id: 'completed', label: 'Completadas', value: 'completed', active: false },
    { id: 'cancelled', label: 'Canceladas', value: 'cancelled', active: false }
  ];

  ngOnInit(): void {
    this.filterBookings();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['bookings']) {
      this.filterBookings();
    }
  }

  /**
   * Filtra las reservas según el filtro activo
   */
  filterBookings(filterValue?: BookingFilter['value']): void {
    if (filterValue) {
      this.activeFilter = filterValue;
      this.updateFilterStates(filterValue);
      this.filterChange.emit(filterValue);
    }

    switch (this.activeFilter) {
      case 'upcoming':
        this.filteredBookings = this.bookings.filter(booking => 
          booking.status === 'confirmed' || booking.status === 'pending'
        );
        break;
      case 'completed':
        this.filteredBookings = this.bookings.filter(booking => 
          booking.status === 'completed'
        );
        break;
      case 'cancelled':
        this.filteredBookings = this.bookings.filter(booking => 
          booking.status === 'cancelled'
        );
        break;
      default:
        this.filteredBookings = [...this.bookings];
    }
  }

  /**
   * Actualiza el estado activo de los filtros
   */
  private updateFilterStates(activeValue: string): void {
    this.bookingFilters = this.bookingFilters.map(filter => ({
      ...filter,
      active: filter.value === activeValue
    }));
  }

  /**
   * Obtiene las clases CSS para el filtro
   */
  getFilterClasses(filterValue: string): Record<string, boolean> {
    return {
      'bookings__filter-btn': true,
      'bookings__filter-btn--active': this.activeFilter === filterValue
    };
  }

  /**
   * Obtiene el label del filtro activo
   */
  getFilterLabel(): string {
    const activeFilter = this.bookingFilters.find(filter => filter.value === this.activeFilter);
    return activeFilter ? activeFilter.label : 'Todas';
  }

  /**
   * Obtiene el mensaje de estado vacío según el filtro activo
   */
  getEmptyStateMessage(): string {
    switch (this.activeFilter) {
      case 'upcoming':
        return 'No tienes reservas próximas. ¡Planifica tu próximo viaje!';
      case 'completed':
        return 'No tienes reservas completadas.';
      case 'cancelled':
        return 'No tienes reservas canceladas.';
      default:
        return 'No tienes reservas. ¡Empieza a explorar destinos!';
    }
  }

  /**
   * Maneja las acciones de reserva
   */
  onBookingAction(event: { action: string, bookingId: string }): void {
    this.bookingAction.emit(event);
  }

  /**
   * Función de tracking para optimizar *ngFor
   */
  trackByBookingId(index: number, item: Booking): string {
    return item.id;
  }

  /**
   * Función de tracking para filtros
   */
  trackByFilterId(index: number, item: BookingFilter): string {
    return item.id;
  }

  /**
   * Obtiene el conteo de reservas por filtro
   */
  getFilterCount(filterValue: string): number {
    switch (filterValue) {
      case 'upcoming':
        return this.bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length;
      case 'completed':
        return this.bookings.filter(b => b.status === 'completed').length;
      case 'cancelled':
        return this.bookings.filter(b => b.status === 'cancelled').length;
      default:
        return this.bookings.length;
    }
  }
}