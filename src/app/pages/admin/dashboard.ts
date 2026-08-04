import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
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
  imageMasterItems = signal<any[]>([]);
  uploadingImage = signal(false);

  // File Upload Helper
  uploadFile(event: Event, callback: (url: string) => void) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.uploadingImage.set(true);

    this.apiService.uploadImage(file).subscribe({
      next: (res) => {
        this.uploadingImage.set(false);
        if (res.status === 'success' && res.data?.url) {
          callback(res.data.url);
          Swal.fire({
            icon: 'success',
            title: 'Image Uploaded!',
            text: 'File saved to server public uploads directory.',
            timer: 1500,
            showConfirmButton: false
          });
        } else {
          Swal.fire({ icon: 'error', title: 'Upload Error', text: res.message || 'Failed to upload image' });
        }
      },
      error: (err) => {
        this.uploadingImage.set(false);
        const msg = err.error?.message || 'Error uploading file to server';
        Swal.fire({ icon: 'error', title: 'Upload Failed', text: msg });
      }
    });
  }

  onCategoryFileSelect(event: Event) {
    this.uploadFile(event, (url) => {
      this.categoryForm.imageUrl = url;
    });
  }

  onProductCoverFileSelect(event: Event) {
    this.uploadFile(event, (url) => {
      this.productForm.images[0] = url;
    });
  }

  onImageMasterFileSelect(event: Event) {
    this.uploadFile(event, (url) => {
      this.imageForm.imageUrl = url;
    });
  }

  onCertFileSelect(event: Event) {
    this.uploadFile(event, (url) => {
      this.certForm.imageUrl = url;
    });
  }

  onGalleryFileSelect(event: Event) {
    this.uploadFile(event, (url) => {
      this.galleryForm.imageUrl = url;
    });
  }

  onBlogFileSelect(event: Event) {
    this.uploadFile(event, (url) => {
      this.blogForm.featuredImage = url;
    });
  }

  // Company Settings Form
  companyForm = {
    companyName: '',
    subtitle: '',
    description: '',
    address: '',
    ownerName: '',
    ownerTitle: '',
    ownerQuote: '',
    phone: '',
    whatsapp: '',
    email: '',
    workingHours: '',
    googleMapEmbedUrl: '',
    supportedLanguages: [] as { code: string; name: string; badge: string }[]
  };

  // Image Master Form
  imageForm = {
    id: '',
    key: '',
    imageUrl: '',
    description: ''
  };
  showImageModal = signal(false);
  isEditImage = signal(false);

  readonly filteredProducts = computed(() => {
    const q = this.productSearchQuery().toLowerCase().trim();
    if (!q) return this.products();
    return this.products().filter(p => 
      p.name?.toLowerCase().includes(q) || 
      p.categoryId?.name?.toLowerCase().includes(q) || 
      p.origin?.toLowerCase().includes(q)
    );
  });

  readonly newInquiriesCount = computed(() => {
    return this.inquiries().filter(i => i.status === 'new').length;
  });

  readonly newQuotesCount = computed(() => {
    return this.quotes().filter(q => q.status === 'new').length;
  });

  // Stats counters form
  statsData = {
    countriesServed: 0,
    shipments: 0,
    yearsExperience: 0,
    happyClients: 0
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
    this.loadCompanyDetails();
    this.loadImageMaster();
  }


  setTab(tab: string) {
    this.activeTab.set(tab);
  }

  onLogout() {
    Swal.fire({
      title: 'Logout?',
      text: 'Are you sure you want to log out of the Admin Dashboard?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, Logout'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        Swal.fire({
          icon: 'success',
          title: 'Logged Out',
          text: 'You have been logged out successfully.',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
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
          Swal.fire({
            icon: 'success',
            title: 'Statistics Updated',
            text: 'Website statistics updated successfully!',
            confirmButtonColor: '#0B3D91'
          });
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
            Swal.fire({ icon: 'success', title: 'Category Updated', confirmButtonColor: '#0B3D91' });
          }
        }
      });
    } else {
      this.apiService.createCategory(this.categoryForm).subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.loadCategories();
            this.showCategoryModal.set(false);
            Swal.fire({ icon: 'success', title: 'Category Created', confirmButtonColor: '#0B3D91' });
          }
        }
      });
    }
  }

  onDeleteCategory(id: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this category?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteCategory(id).subscribe({
          next: () => {
            this.loadCategories();
            Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Category has been deleted.', confirmButtonColor: '#0B3D91' });
          },
          error: (err) => Swal.fire({ icon: 'error', title: 'Error', text: err.error?.message || 'Failed to delete category.', confirmButtonColor: '#0B3D91' })
        });
      }
    });
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
            Swal.fire({ icon: 'success', title: 'Product Updated', confirmButtonColor: '#0B3D91' });
          }
        },
        error: (err) => {
          console.error('Failed to update product:', err);
          Swal.fire({ icon: 'error', title: 'Error', text: err.error?.message || 'Failed to update product details.', confirmButtonColor: '#0B3D91' });
        }
      });
    } else {
      this.apiService.createProduct(payload).subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.loadProducts();
            this.showProductModal.set(false);
            Swal.fire({ icon: 'success', title: 'Product Created', confirmButtonColor: '#0B3D91' });
          }
        },
        error: (err) => {
          console.error('Failed to create product:', err);
          Swal.fire({ icon: 'error', title: 'Error', text: err.error?.message || 'Failed to create new product.', confirmButtonColor: '#0B3D91' });
        }
      });
    }
  }

  onDeleteProduct(id: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this product?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteProduct(id).subscribe({
          next: () => {
            this.loadProducts();
            Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Product has been deleted.', confirmButtonColor: '#0B3D91' });
          }
        });
      }
    });
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
    Swal.fire({
      title: 'Delete Inquiry?',
      text: 'Are you sure you want to delete this inquiry log?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteInquiry(id).subscribe({
          next: () => {
            this.loadInquiries();
            Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Inquiry log has been deleted.', confirmButtonColor: '#0B3D91' });
          }
        });
      }
    });
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
    Swal.fire({
      title: 'Delete Quote Request?',
      text: 'Are you sure you want to delete this quote request log?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteQuote(id).subscribe({
          next: () => {
            this.loadQuotes();
            Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Quote request log has been deleted.', confirmButtonColor: '#0B3D91' });
          }
        });
      }
    });
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
            Swal.fire({ icon: 'success', title: 'Blog Post Updated', confirmButtonColor: '#0B3D91' });
          }
        }
      });
    } else {
      this.apiService.createBlog(this.blogForm).subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.loadBlogs();
            this.showBlogModal.set(false);
            Swal.fire({ icon: 'success', title: 'Blog Post Published', confirmButtonColor: '#0B3D91' });
          }
        }
      });
    }
  }

  onDeleteBlog(id: string) {
    Swal.fire({
      title: 'Delete Blog Post?',
      text: 'Are you sure you want to delete this blog post?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteBlog(id).subscribe({
          next: () => {
            this.loadBlogs();
            Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Blog post has been deleted.', confirmButtonColor: '#0B3D91' });
          }
        });
      }
    });
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
          Swal.fire({ icon: 'success', title: 'Photo Added to Gallery', confirmButtonColor: '#0B3D91' });
        }
      }
    });
  }

  onDeleteGallery(id: string) {
    Swal.fire({
      title: 'Delete Photo?',
      text: 'Delete this photo from operations gallery?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteGalleryItem(id).subscribe({
          next: () => {
            this.loadGallery();
            Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Gallery photo has been deleted.', confirmButtonColor: '#0B3D91' });
          }
        });
      }
    });
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
            Swal.fire({ icon: 'success', title: 'Certification Updated', confirmButtonColor: '#0B3D91' });
          }
        }
      });
    } else {
      this.apiService.createCertification(this.certForm).subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.loadCertifications();
            this.showCertModal.set(false);
            Swal.fire({ icon: 'success', title: 'Certification Created', confirmButtonColor: '#0B3D91' });
          }
        }
      });
    }
  }

  onDeleteCert(id: string) {
    Swal.fire({
      title: 'Delete Certification?',
      text: 'Are you sure you want to delete this certification item?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteCertification(id).subscribe({
          next: () => {
            this.loadCertifications();
            Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Certification item has been deleted.', confirmButtonColor: '#0B3D91' });
          }
        });
      }
    });
  }

  // --- COMPANY DETAILS CRUD ---
  loadCompanyDetails() {
    this.apiService.getCompanyDetails().subscribe({
      next: (res) => {
        if (res.status === 'success' && res.data) {
          const d = res.data;
          this.companyForm = {
            companyName: d.companyName || '',
            subtitle: d.subtitle || '',
            description: d.description || '',
            address: d.address || '',
            ownerName: d.ownerName || '',
            ownerTitle: d.ownerTitle || '',
            ownerQuote: d.ownerQuote || '',
            phone: d.phone || '',
            whatsapp: d.whatsapp || '',
            email: d.email || '',
            workingHours: d.workingHours || '',
            googleMapEmbedUrl: d.googleMapEmbedUrl || '',
            supportedLanguages: d.supportedLanguages || []
          };
        }
      }
    });
  }

  onSaveCompanyDetails() {
    this.apiService.updateCompanyDetails(this.companyForm).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          Swal.fire({
            icon: 'success',
            title: 'Company Settings Saved!',
            text: 'Company details and language settings updated successfully.',
            confirmButtonColor: '#0B3D91'
          });
        }
      }
    });
  }

  addLanguage() {
    this.companyForm.supportedLanguages.push({ code: '', name: '', badge: '' });
  }

  removeLanguage(index: number) {
    this.companyForm.supportedLanguages.splice(index, 1);
  }

  // --- IMAGE MASTER CRUD ---
  loadImageMaster() {
    this.apiService.getImageMaster().subscribe({
      next: (res) => {
        if (res.status === 'success' && res.data) {
          this.imageMasterItems.set(res.data);
        }
      }
    });
  }

  openAddImage(presetKey?: string) {
    this.imageForm = {
      id: '',
      key: presetKey || '',
      imageUrl: '',
      description: ''
    };
    this.isEditImage.set(false);
    this.showImageModal.set(true);
  }

  openEditImage(item: any) {
    this.imageForm = {
      id: item._id,
      key: item.key,
      imageUrl: item.imageUrl,
      description: item.description || ''
    };
    this.isEditImage.set(true);
    this.showImageModal.set(true);
  }

  onSubmitImage() {
    if (!this.imageForm.key || !this.imageForm.imageUrl) {
      Swal.fire({ icon: 'warning', title: 'Missing Information', text: 'Key Name and Image URL are required!', confirmButtonColor: '#0B3D91' });
      return;
    }

    if (this.isEditImage()) {
      this.apiService.updateImageMaster(this.imageForm.id, this.imageForm).subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.loadImageMaster();
            this.showImageModal.set(false);
            Swal.fire({ icon: 'success', title: 'Image Entry Updated', confirmButtonColor: '#0B3D91' });
          }
        }
      });
    } else {
      this.apiService.createImageMaster(this.imageForm).subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.loadImageMaster();
            this.showImageModal.set(false);
            Swal.fire({ icon: 'success', title: 'Image Entry Added', confirmButtonColor: '#0B3D91' });
          }
        }
      });
    }
  }

  onDeleteImage(id: string) {
    Swal.fire({
      title: 'Delete Image Entry?',
      text: 'Are you sure you want to delete this Image Master entry?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteImageMaster(id).subscribe({
          next: () => {
            this.loadImageMaster();
            Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Image Master entry has been deleted.', confirmButtonColor: '#0B3D91' });
          }
        });
      }
    });
  }
}

