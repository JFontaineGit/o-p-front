import { Component } from '@angular/core';
import { Hero} from '../../shared/hero/hero';
import { Search } from '../../shared/search/search';
import { ProductList } from '../../shared/product-card/product-list/product-list';
import { ServicesSection } from '../../shared/aside-card/services-section/services-section';
import { TestimonialsSection } from '../../shared/testimonial-section/testimonial-section';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Hero, Search, ProductList, ServicesSection, TestimonialsSection],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

}
