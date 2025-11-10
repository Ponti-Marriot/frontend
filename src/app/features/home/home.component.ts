import { Component } from '@angular/core';
import {
  HomeHeaderComponent,
  NavLink,
} from './components/home-header/home-header.component';
import {
  HomeHeroComponent,
  HeroAction,
} from './components/home-hero/home-hero.component';
import {
  HomeFooterComponent,
  FooterGroup,
} from './components/home-footer/home-footer.component';
import { HomeAboutComponent } from './components/home-about/home-about.component';
import { HomeHotelsComponent } from './components/home-hotels/home-hotels.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NgIf,
    HomeHeaderComponent,
    HomeHeroComponent,
    HomeAboutComponent,
    HomeHotelsComponent,
    HomeFooterComponent,
  ],
  templateUrl: './home.component.html',
  styles: ``,
})
export class HomeComponent {
  navLinks: NavLink[] = [
    { label: 'Home', href: '/', active: true },
    { label: 'Hotels', href: '/hotels', active: false },
    { label: 'About', href: '/about', active: false },
  ];

  activeSection: 'home' | 'hotels' | 'about' = 'home';

  heroBg = '/images/luxury-hotel-hero.jpeg';
  heroTitle = 'Wander Unwind Your Journey Begins Here';
  heroSubtitle =
    'Whether you seek the thrill of uncharted paths or the stillness of a coastal sunrise, we craft stays that feel intentional. Every location is designed for calm, beauty, and presence.';
  heroCta: HeroAction = {
    label: 'Sign in',
    href: '/auth/signin',
  };

  brandsTitle = 'Trusted by world-class names';
  brands = [
    { name: 'Marriott', logo: '/images/brands/marriott.webp' },
    { name: 'Hilton', logo: '/images/brands/hilton.webp' },
    { name: 'Hyatt', logo: '/images/brands/hyatt.webp' },
    { name: 'Four Seasons', logo: '/images/brands/fourseasons.webp' },
    { name: 'Ritz Carlton', logo: '/images/brands/ritzcarlton.webp' },
    { name: 'Waldorf Astoria', logo: '/images/brands/waldorf.webp' },
    { name: 'Fairmont', logo: '/images/brands/fairmont.webp' },
    { name: 'Rosewood', logo: '/images/brands/rosewood.webp' },
  ];

  footerGroups: FooterGroup[] = [
    {
      title: 'Company',
      links: [
        { label: 'About us', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Press', href: '#' },
        { label: 'Sustainability', href: '#' },
      ],
    },
    {
      title: 'Discover',
      links: [
        { label: 'Destinations', href: '#' },
        { label: 'Wellness & Spa', href: '#' },
        { label: 'Events & Retreats', href: '#' },
        { label: 'Business Travel', href: '#' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Help center', href: '#' },
        { label: 'Contact', href: '#' },
        { label: 'Accessibility', href: '#' },
        { label: 'Privacy & Terms', href: '#' },
      ],
    },
  ];

  onNavSelect(target: string) {
    if (target === '/' || target === 'logo') {
      this.activeSection = 'home';
    } else if (target === '/hotels') {
      this.activeSection = 'hotels';
    } else if (target === '/about') {
      this.activeSection = 'about';
    }

    this.navLinks = this.navLinks.map((link) => ({
      ...link,
      active:
        (link.href === '/' && this.activeSection === 'home') ||
        (link.href === '/hotels' && this.activeSection === 'hotels') ||
        (link.href === '/about' && this.activeSection === 'about'),
    }));
  }
}
