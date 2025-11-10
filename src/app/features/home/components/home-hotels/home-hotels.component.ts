import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

interface Hotel {
  name: string;
  city: string;
  image: string;
  description: string;
  rating: string;
  priceFrom: string;
}

@Component({
  selector: 'app-home-hotels',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './home-hotels.component.html',
})
export class HomeHotelsComponent {
  hotels: Hotel[] = [
    {
      name: 'Ponti Marriot Medellín',
      city: 'El Poblado · Medellín, Colombia',
      image: '/images/luxury-hotels-1.jpg',
      description:
        'Rooftop infinity pool, botanical interior design, and award-winning fusion cuisine. Steps from nightlife and premium shopping.',
      rating: '4.9',
      priceFrom: '$220',
    },
    {
      name: 'Ponti Marriot Cartagena',
      city: 'Historic District · Cartagena, Colombia',
      image: '/images/luxury-hotels-2.jpg',
      description:
        'Colonial façade, Caribbean-facing suites, and private sunset terraces inside the walled city. Ocean breeze included.',
      rating: '4.8',
      priceFrom: '$310',
    },
    {
      name: 'Ponti Marriot Bogotá',
      city: 'Financial Zone · Bogotá, Colombia',
      image: '/images/luxury-hotels-3.jpg',
      description:
        'Executive tower with skyline views, executive lounge access, gym & spa. Perfect for corporate stays and weekend escapes.',
      rating: '5.0',
      priceFrom: '$260',
    },
  ];
}
