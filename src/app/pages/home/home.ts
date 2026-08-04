import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { MapComponent } from '../../components/map/map';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MapComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  private apiService = inject(ApiService);

  stats = signal<any>(null);
  imagesMap = signal<{ [key: string]: string }>({});

  categories = signal<any[]>([]);
  testimonials = signal<any[]>([]);
  faqs = signal<any[]>([]);
  certifications = signal<any[]>([]);

  activeFaqIndex = signal<number | null>(null);
  activeTestimonialIndex = signal<number>(0);

  ngOnInit() {
    this.loadStats();
    this.loadCategories();
    this.loadTestimonials();
    this.loadFaqs();
    this.loadCertifications();
    this.loadImageMaster();
  }

  loadImageMaster() {
    this.apiService.getImageMaster().subscribe({
      next: (res) => {
        if (res.status === 'success' && res.map) {
          this.imagesMap.set(res.map);
        }
      }
    });
  }

  loadStats() {
    this.apiService.getStatistics().subscribe({
      next: (res) => {
        if (res.status === 'success' && res.data) {
          this.stats.set(res.data);
        }
      }
    });
  }

  loadCategories() {
    this.apiService.getCategories().subscribe({
      next: (res) => {
        if (res.status === 'success' && res.data) {
          this.categories.set(res.data.slice(0, 8)); // show max 8 categories on Home
        }
      }
    });
  }

  loadTestimonials() {
    this.apiService.getTestimonials().subscribe({
      next: (res) => {
        if (res.status === 'success' && res.data) {
          this.testimonials.set(res.data);
        }
      }
    });
  }

  loadFaqs() {
    this.apiService.getFaqs().subscribe({
      next: (res) => {
        if (res.status === 'success' && res.data) {
          this.faqs.set(res.data);
        }
      }
    });
  }

  loadCertifications() {
    this.apiService.getCertifications().subscribe({
      next: (res) => {
        if (res.status === 'success' && res.data) {
          this.certifications.set(res.data);
        }
      }
    });
  }

  toggleFaq(index: number) {
    this.activeFaqIndex.update(v => v === index ? null : index);
  }

  nextTestimonial() {
    if (this.testimonials().length === 0) return;
    this.activeTestimonialIndex.update(idx => (idx + 1) % this.testimonials().length);
  }

  prevTestimonial() {
    if (this.testimonials().length === 0) return;
    this.activeTestimonialIndex.update(idx => (idx - 1 + this.testimonials().length) % this.testimonials().length);
  }
}
