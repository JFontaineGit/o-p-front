import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Booking } from '../interfaces/user-panel.interfaces';

@Component({
  selector: 'app-booking-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-card.html',
  styleUrls: ['./booking-card.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingCard {
  
  @Input({ required: true }) booking!: Booking;
  @Input() showActions = true;
  
  @Output() action = new EventEmitter<{action: string, bookingId: string}>();
  @Output() click = new EventEmitter<Booking>();

  /**
   * Emite evento de acción de reserva
   */
  onAction(action: string, event: Event): void {
    event.stopPropagation();
    this.action.emit({ action, bookingId: this.booking.id });
  }

  /**
   * Emite evento al hacer click en la tarjeta
   */
  onClick(): void {
    this.click.emit(this.booking);
  }

  /**
   * Obtiene el texto del estado de la reserva
   */
  getStatusText(): string {
    const statusMap = {
      confirmed: 'Confirmado',
      completed: 'Completado',
      cancelled: 'Cancelado',
      pending: 'Pendiente'
    };
    return statusMap[this.booking.status] || this.booking.status;
  }

  /**
   * Obtiene las clases CSS para el estado
   */
  getStatusClasses(): Record<string, boolean> {
    return {
      'booking-card__status': true,
      [`booking-card__status--${this.booking.status}`]: true
    };
  }

  /**
   * Formatea el precio con moneda
   */
  formatPrice(): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(this.booking.price);
  }

  /**
   * Formatea las fechas de la reserva
   */
  formatDates(): string {
    const start = new Date(this.booking.startDate).toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
    const end = new Date(this.booking.endDate).toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
    return `${start} - ${end}`;
  }

  /**
   * Obtiene las acciones disponibles según el estado
   */
  getAvailableActions(): Array<{action: string, label: string, variant: string}> {
    const actions = [
      { action: 'view', label: 'Ver Detalles', variant: 'outline' }
    ];

    switch (this.booking.status) {
      case 'confirmed':
        actions.push({ action: 'modify', label: 'Modificar', variant: 'primary' });
        actions.push({ action: 'cancel', label: 'Cancelar', variant: 'error' });
        break;
      case 'completed':
        actions.push({ action: 'rate', label: 'Valorar', variant: 'secondary' });
        break;
      case 'pending':
        actions.push({ action: 'confirm', label: 'Confirmar', variant: 'success' });
        break;
    }

    return actions;
  }
}