import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { FilterInput, FilterOption } from './filter-input/filter-input';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FilterInput],
  templateUrl: './search.html',
  styleUrls: ['./search.scss'],
})
export class Search implements OnInit {
  @Output() clearFilters = new EventEmitter<void>();
  @Output() filtersChanged = new EventEmitter<any>();

  filtersForm: FormGroup;

  accommodationTypeOptions: FilterOption[] = [
    { value: 'hotel', label: 'Hotel' },
    { value: 'hostel', label: 'Hostel' },
    { value: 'habitacion', label: 'Habitación' },
    { value: 'cabana', label: 'Cabaña' },
  ];

  priceOptions: FilterOption[] = [
    { value: '800', label: 'Hasta €800' },
    { value: '1000', label: 'Hasta €1,000' },
    { value: '1200', label: 'Hasta €1,200' },
    { value: '1500', label: 'Hasta €1,500' },
  ];

  guestsOptions: FilterOption[] = [
    { value: '1', label: '1 huésped' },
    { value: '2', label: '2 huéspedes' },
    { value: '3', label: '3 huéspedes' },
    { value: '4', label: '4+ huéspedes' },
  ];

  sortOptions: FilterOption[] = [
    { value: 'relevance', label: 'Relevancia' },
    { value: 'price-low', label: 'Precio: menor a mayor' },
    { value: 'price-high', label: 'Precio: mayor a menor' },
    { value: 'guests', label: 'Capacidad' },
  ];

  constructor(private fb: FormBuilder) {
    this.filtersForm = this.fb.group({
      accommodationType: new FormControl(''),
      maxPrice: new FormControl(''),
      guests: new FormControl(''),
      sortBy: new FormControl('relevance'),
    });
  }

  ngOnInit() {
    this.filtersForm.valueChanges.subscribe((values) => {
      this.filtersChanged.emit(values);
    });
  }

  onClearFilters() {
    this.filtersForm.reset({
      accommodationType: '',
      maxPrice: '',
      guests: '',
      sortBy: 'relevance',
    });
    this.clearFilters.emit();
  }

  get accommodationTypeControl(): FormControl {
    return this.filtersForm.get('accommodationType') as FormControl;
  }

  get maxPriceControl(): FormControl {
    return this.filtersForm.get('maxPrice') as FormControl;
  }

  get guestsControl(): FormControl {
    return this.filtersForm.get('guests') as FormControl;
  }

  get sortByControl(): FormControl {
    return this.filtersForm.get('sortBy') as FormControl;
  }
}