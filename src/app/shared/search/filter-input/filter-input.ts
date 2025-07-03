import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

export interface FilterOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-filter-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FilterInput),
      multi: true,
    },
  ],
  templateUrl: './filter-input.html',
  styleUrls: ['./filter-input.scss'],
})
export class FilterInput implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() options: FilterOption[] = [];
  @Input() placeholder: string = 'Seleccionar...';

  value: string = '';
  disabled = false;

  onChange = (value: string) => {};
  onTouched = () => {};

  get filterId(): string {
    return `filter-${this.label.toLowerCase().replace(/\s+/g, '-')}`;
  }

  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onValueChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    this.value = value;
    this.onChange(value);
    this.onTouched();
  }
}