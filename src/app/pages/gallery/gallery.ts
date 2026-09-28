import { Component, OnInit, signal, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-gallery-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss'
})
export class GalleryComponent implements OnInit {
  private apiService = inject(ApiService);

  galleryItems = signal<any[]>([]);
  selectedCategory = signal<string>('');
  
  // Lightbox overlay states
  lightboxImage = signal<string>('');
  showLightbox = signal(false);

  ngOnInit() {
    this.loadGallery();
  }

  @HostListener('document:keydown.escape')
  handleEscape() {
    if (this.showLightbox()) {
      this.closeLightbox();
    }
  }

  loadGallery() {
    this.apiService.getGallery(this.selectedCategory()).subscribe({
      next: (res) => {
        if (res.status === 'success' && res.data) {
          this.galleryItems.set(res.data);
        }
      }
    });
  }

  filterCategory(cat: string) {
    this.selectedCategory.set(cat);
    this.loadGallery();
  }

  openLightbox(imgUrl: string) {
    this.lightboxImage.set(imgUrl);
    this.showLightbox.set(true);
  }

  closeLightbox() {
    this.showLightbox.set(false);
  }
}
