import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-product-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCatalogComponent implements OnInit {
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);

  products = signal<any[]>([]);
  categories = signal<any[]>([]);
  selectedCategory = signal<string>('');
  searchQuery = signal<string>('');
  
  // Pagination variables
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  totalProducts = signal<number>(0);
  limit = 12;

  readonly pagesArray = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  ngOnInit() {
    this.loadCategories();
    
    // Subscribe to query parameters to handle navigation links
    this.route.queryParams.subscribe(params => {
      this.selectedCategory.set(params['category'] || '');
      this.currentPage.set(1);
      this.loadProducts();
    });
  }

  loadCategories() {
    this.apiService.getCategories().subscribe({
      next: (res) => {
        if (res.status === 'success' && res.data) {
          this.categories.set(res.data);
        }
      }
    });
  }

  loadProducts() {
    const params = {
      category: this.selectedCategory(),
      search: this.searchQuery(),
      page: this.currentPage(),
      limit: this.limit
    };

    this.apiService.getProducts(params).subscribe({
      next: (res) => {
        if (res.status === 'success' && res.data) {
          this.products.set(res.data);
          if (res.pagination) {
            this.totalProducts.set(res.pagination.total);
            this.totalPages.set(res.pagination.pages);
          }
        }
      }
    });
  }

  onSearch() {
    this.currentPage.set(1);
    this.loadProducts();
  }

  selectCategory(slug: string) {
    this.selectedCategory.set(slug);
    this.currentPage.set(1);
    this.loadProducts();
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadProducts();
      window.scrollTo(0, 0);
    }
  }
}
