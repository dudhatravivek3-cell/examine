import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class AdminDashboardComponent implements OnInit {
  private apiService = inject(ApiService);
  public authService = inject(AuthService);

  activeTab = signal<string>('products');
  productSearchQuery = signal<string>('');

  // Master Lists
  products = signal<any[]>([]);
  categories = signal<any[]>([]);
  inquiries = signal<any[]>([]);
  quotes = signal<any[]>([]);
  blogs = signal<any[]>([]);
  galleryItems = signal<any[]>([]);
  certifications = signal<any[]>([]);

  get filteredProducts() {
    const q = this.productSearchQuery().toLowerCase().trim();
    if (!q) return this.products();
    return this.products().filter(p => 
      p.name?.toLowerCase().includes(q) || 
      p.categoryId?.name?.toLowerCase().includes(q) || 
      p.origin?.toLowerCase().includes(q)
    );
  }

  get newInquiriesCount() {
    return this.inquiries().filter(i => i.status === 'new').length;
  }

  get newQuotesCount() {
    return this.quotes().filter(q => q.status === 'new').length;
  }

  // Stats counters form
  statsData = {
    countriesServed: 30,
    shipments: 5000,
    yearsExperience: 10,
    happyClients: 1000
  };

  // Category Form
  categoryForm = {
    id: '',
    name: '',
    description: '',
    imageUrl: '',
    slug: ''
  };
  showCategoryModal = signal(false);
  isEditCategory = signal(false);

  // Product Form
  productForm = {
    id: '',
    categoryId: '',
    name: '',
    description: '',
    origin: '',
    moq: '',
    packagingInfo: '',
    exportAvailability: '',
    images: [''],
    specifications: [] as { key: string; value: string }[]
  };
  showProductModal = signal(false);
  isEditProduct = signal(false);

  // Blog Form
  blogForm = {
    id: '',
    title: '',
    summary: '',
    content: '',
    featuredImage: '',
    slug: ''
  };
  showBlogModal = signal(false);
  isEditBlog = signal(false);

  // Gallery Form
  galleryForm = {
    title: '',
    category: 'Products',
    imageUrl: ''
  };
  showGalleryModal = signal(false);

  // Certification Form
  certForm = {
    id: '',
    title: '',
    description: '',
    pdfUrl: '',
    imageUrl: ''
  };
  showCertModal = signal(false);
  isEditCert = signal(false);

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
    this.loadInquiries();
    this.loadQuotes();
    this.loadBlogs();
    this.loadGallery();
    this.loadCertifications();
    this.loadStats();
  }


  setTab(tab: string) {
    this.activeTab.set(tab);
  }

  onLogout() {
    this.authService.logout();
  }

  // --- STATS ---
  loadStats() {
    this.apiService.getStatistics().subscribe({
      next: (res) => {
        if (res.status === 'success' && res.data) {
          this.statsData = {
            countriesServed: res.data.countriesServed,
            shipments: res.data.shipments,
            yearsExperience: res.data.yearsExperience,
            happyClients: res.data.happyClients
          };
        }
      }
    });
  }

  onSaveStats() {
    this.apiService.updateStatistics(this.statsData).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          alert('Statistics updated successfully!');
        }
      }
    });
  }

  // --- CATEGORIES CRUD ---
  loadCategories() {
    this.apiService.getCategories().subscribe({
      next: (res) => {
        if (res.status === 'success' && res.data) {
          this.categories.set(res.data);
        }
      }
    });
  }

  openAddCategory() {
    this.categoryForm = { id: '', name: '', description: '', imageUrl: '', slug: '' };
    this.isEditCategory.set(false);
    this.showCategoryModal.set(true);
  }

  openEditCategory(cat: any) {
    this.categoryForm = {
      id: cat._id,
      name: cat.name,
      description: cat.description || '',
      imageUrl: cat.imageUrl || '',
      slug: cat.slug
    };
    this.isEditCategory.set(true);
    this.showCategoryModal.set(true);
  }

  onSubmitCategory() {
    if (this.isEditCategory()) {
      this.apiService.updateCategory(this.categoryForm.id, this.categoryForm).subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.loadCategories();
            this.showCategoryModal.set(false);
          }
        }
      });
    } else {
      this.apiService.createCategory(this.categoryForm).subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.loadCategories();
            this.showCategoryModal.set(false);
          }
        }
      });
    }
  }

  onDeleteCategory(id: string) {
    if (confirm('Are you sure you want to delete this category?')) {
      this.apiService.deleteCategory(id).subscribe({
        next: () => this.loadCategories(),
        error: (err) => alert(err.error?.message || 'Failed to delete category.')
      });
    }
  }

  // --- PRODUCTS CRUD ---
  loadProducts() {
    this.apiService.getProducts({ page: 1, limit: 100 }).subscribe({
      next: (res) => {
        if (res.status === 'success' && res.data) {
          this.products.set(res.data);
        }
      }
    });
  }

  openAddProduct() {
    this.productForm = {
      id: '',
      categoryId: '',
      name: '',
      description: '',
      origin: '',
      moq: '',
      packagingInfo: '',
      exportAvailability: '',
      images: [''],
      specifications: [{ key: '', value: '' }]
    };
    this.isEditProduct.set(false);
    this.showProductModal.set(true);
  }

  openEditProduct(prod: any) {
    const specsArray: { key: string; value: string }[] = [];
    if (prod.specifications) {
      Object.keys(prod.specifications).forEach(k => {
        specsArray.push({ key: k, value: prod.specifications[k] });
      });
    }

    let catId = '';
    if (typeof prod.categoryId === 'object' && prod.categoryId !== null) {
      catId = prod.categoryId._id || prod.categoryId.id || '';
    } else if (typeof prod.categoryId === 'string') {
      catId = prod.categoryId;
    }

    const imgList = Array.isArray(prod.images) && prod.images.length > 0 
      ? [...prod.images] 
      : (prod.imageUrl ? [prod.imageUrl] : ['']);

    this.productForm = {
      id: prod._id,
      categoryId: catId,
      name: prod.name || '',
      description: prod.description || '',
      origin: prod.origin || '',
      moq: prod.moq || '',
      packagingInfo: prod.packagingInfo || '',
      exportAvailability: prod.exportAvailability || '',
      images: imgList,
      specifications: specsArray.length > 0 ? specsArray : [{ key: '', value: '' }]
    };
    this.isEditProduct.set(true);
    this.showProductModal.set(true);
  }

  addFormSpec() {
    this.productForm.specifications.push({ key: '', value: '' });
  }

  removeFormSpec(idx: number) {
    this.productForm.specifications.splice(idx, 1);
  }

  onSubmitProduct() {
    const specsObj: { [key: string]: string } = {};
    this.productForm.specifications.forEach(s => {
      if (s.key.trim() && s.value.trim()) {
        specsObj[s.key.trim()] = s.value.trim();
      }
    });

    const validImages = this.productForm.images.filter(img => img && img.trim() !== '');

    const payload = {
      categoryId: this.productForm.categoryId,
      name: this.productForm.name,
      description: this.productForm.description,
      origin: this.productForm.origin,
      moq: this.productForm.moq,
      packagingInfo: this.productForm.packagingInfo,
      exportAvailability: this.productForm.exportAvailability,
      images: validImages.length > 0 ? validImages : ['https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=800&q=80'],
      specifications: specsObj
    };

    if (this.isEditProduct()) {
      this.apiService.updateProduct(this.productForm.id, payload).subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.loadProducts();
            this.showProductModal.set(false);
          }
        },
        error: (err) => {
          console.error('Failed to update product:', err);
          alert(err.error?.message || 'Failed to update product details.');
        }
      });
    } else {
      this.apiService.createProduct(payload).subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.loadProducts();
            this.showProductModal.set(false);
          }
        },
        error: (err) => {
          console.error('Failed to create product:', err);
          alert(err.error?.message || 'Failed to create new product.');
        }
      });
    }
  }

  onDeleteProduct(id: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.apiService.deleteProduct(id).subscribe({
        next: () => this.loadProducts()
      });
    }
  }

  // --- INQUIRIES ---
  loadInquiries() {
    this.apiService.getInquiries().subscribe({
      next: (res) => {
        if (res.status === 'success' && res.data) {
          this.inquiries.set(res.data);
        }
      }
    });
  }

  updateInquiry(id: string, status: string) {
    this.apiService.updateInquiryStatus(id, status).subscribe({
      next: () => this.loadInquiries()
    });
  }

  onDeleteInquiry(id: string) {
    if (confirm('Delete this inquiry log?')) {
      this.apiService.deleteInquiry(id).subscribe({
        next: () => this.loadInquiries()
      });
    }
  }

  // --- QUOTES ---
  loadQuotes() {
    this.apiService.getQuotes().subscribe({
      next: (res) => {
        if (res.status === 'success' && res.data) {
          this.quotes.set(res.data);
        }
      }
    });
  }

  updateQuote(id: string, status: string) {
    this.apiService.updateQuoteStatus(id, status).subscribe({
      next: () => this.loadQuotes()
    });
  }

  onDeleteQuote(id: string) {
    if (confirm('Delete this quote request log?')) {
      this.apiService.deleteQuote(id).subscribe({
        next: () => this.loadQuotes()
      });
    }
  }

  // --- BLOGS CRUD ---
  loadBlogs() {
    this.apiService.getBlogs().subscribe({
      next: (res) => {
        if (res.status === 'success' && res.data) {
          this.blogs.set(res.data);
        }
      }
    });
  }

  openAddBlog() {
    this.blogForm = { id: '', title: '', summary: '', content: '', featuredImage: '', slug: '' };
    this.isEditBlog.set(false);
    this.showBlogModal.set(true);
  }

  openEditBlog(blog: any) {
    this.blogForm = {
      id: blog._id,
      title: blog.title,
      summary: blog.summary || '',
      content: blog.content || '',
      featuredImage: blog.featuredImage || '',
      slug: blog.slug || ''
    };
    this.isEditBlog.set(true);
    this.showBlogModal.set(true);
  }

  onSubmitBlog() {
    if (this.isEditBlog()) {
      this.apiService.updateBlog(this.blogForm.id, this.blogForm).subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.loadBlogs();
            this.showBlogModal.set(false);
          }
        }
      });
    } else {
      this.apiService.createBlog(this.blogForm).subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.loadBlogs();
            this.showBlogModal.set(false);
          }
        }
      });
    }
  }

  onDeleteBlog(id: string) {
    if (confirm('Are you sure you want to delete this blog post?')) {
      this.apiService.deleteBlog(id).subscribe({
        next: () => this.loadBlogs()
      });
    }
  }

  // --- GALLERY CRUD ---
  loadGallery() {
    this.apiService.getGallery().subscribe({
      next: (res) => {
        if (res.status === 'success' && res.data) {
          this.galleryItems.set(res.data);
        }
      }
    });
  }

  openAddGallery() {
    this.galleryForm = { title: '', category: 'Products', imageUrl: '' };
    this.showGalleryModal.set(true);
  }

  onSubmitGallery() {
    this.apiService.createGalleryItem(this.galleryForm).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.loadGallery();
          this.showGalleryModal.set(false);
        }
      }
    });
  }

  onDeleteGallery(id: string) {
    if (confirm('Delete this photo from operations gallery?')) {
      this.apiService.deleteGalleryItem(id).subscribe({
        next: () => this.loadGallery()
      });
    }
  }

  // --- CERTIFICATIONS CRUD ---
  loadCertifications() {
    this.apiService.getCertifications().subscribe({
      next: (res) => {
        if (res.status === 'success' && res.data) {
          this.certifications.set(res.data);
        }
      }
    });
  }

  openAddCert() {
    this.certForm = { id: '', title: '', description: '', pdfUrl: '', imageUrl: '' };
    this.isEditCert.set(false);
    this.showCertModal.set(true);
  }

  openEditCert(cert: any) {
    this.certForm = {
      id: cert._id,
      title: cert.title,
      description: cert.description || '',
      pdfUrl: cert.pdfUrl || '',
      imageUrl: cert.imageUrl || ''
    };
    this.isEditCert.set(true);
    this.showCertModal.set(true);
  }

  onSubmitCert() {
    if (this.isEditCert()) {
      this.apiService.updateCertification(this.certForm.id, this.certForm).subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.loadCertifications();
            this.showCertModal.set(false);
          }
        }
      });
    } else {
      this.apiService.createCertification(this.certForm).subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.loadCertifications();
            this.showCertModal.set(false);
          }
        }
      });
    }
  }

  onDeleteCert(id: string) {
    if (confirm('Delete this certification item?')) {
      this.apiService.deleteCertification(id).subscribe({
        next: () => this.loadCertifications()
      });
    }
  }
}

