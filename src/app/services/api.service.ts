import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://192.168.1.130:5000/api';

  constructor(private http: HttpClient) {}

  // Helper to generate headers with Admin JWT Token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('admin_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // ==========================================
  // CATEGORIES
  // ==========================================
  getCategories(): Observable<any> {
    return this.http.get(`${this.baseUrl}/categories`);
  }

  getCategoryBySlug(slug: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/categories/${slug}`);
  }

  createCategory(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/categories`, data, { headers: this.getHeaders() });
  }

  updateCategory(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/categories/${id}`, data, { headers: this.getHeaders() });
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/categories/${id}`, { headers: this.getHeaders() });
  }

  // ==========================================
  // PRODUCTS
  // ==========================================
  getProducts(paramsObj?: { category?: string; search?: string; page?: number; limit?: number }): Observable<any> {
    let params = new HttpParams();
    if (paramsObj) {
      if (paramsObj.category) params = params.set('category', paramsObj.category);
      if (paramsObj.search) params = params.set('search', paramsObj.search);
      if (paramsObj.page) params = params.set('page', paramsObj.page.toString());
      if (paramsObj.limit) params = params.set('limit', paramsObj.limit.toString());
    }
    return this.http.get(`${this.baseUrl}/products`, { params });
  }

  getProductBySlug(slug: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/products/${slug}`);
  }

  createProduct(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/products`, data, { headers: this.getHeaders() });
  }

  updateProduct(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/products/${id}`, data, { headers: this.getHeaders() });
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/products/${id}`, { headers: this.getHeaders() });
  }

  // ==========================================
  // INQUIRIES
  // ==========================================
  submitInquiry(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/inquiries`, data);
  }

  getInquiries(): Observable<any> {
    return this.http.get(`${this.baseUrl}/inquiries`, { headers: this.getHeaders() });
  }

  updateInquiryStatus(id: string, status: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/inquiries/${id}`, { status }, { headers: this.getHeaders() });
  }

  deleteInquiry(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/inquiries/${id}`, { headers: this.getHeaders() });
  }

  // ==========================================
  // QUOTES
  // ==========================================
  submitQuote(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/quotes`, data);
  }

  getQuotes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/quotes`, { headers: this.getHeaders() });
  }

  updateQuoteStatus(id: string, status: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/quotes/${id}`, { status }, { headers: this.getHeaders() });
  }

  deleteQuote(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/quotes/${id}`, { headers: this.getHeaders() });
  }

  // ==========================================
  // BLOGS
  // ==========================================
  getBlogs(): Observable<any> {
    return this.http.get(`${this.baseUrl}/blogs`);
  }

  getBlogBySlug(slug: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/blogs/${slug}`);
  }

  createBlog(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/blogs`, data, { headers: this.getHeaders() });
  }

  updateBlog(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/blogs/${id}`, data, { headers: this.getHeaders() });
  }

  deleteBlog(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/blogs/${id}`, { headers: this.getHeaders() });
  }

  // ==========================================
  // GALLERY
  // ==========================================
  getGallery(category?: string): Observable<any> {
    let params = new HttpParams();
    if (category) {
      params = params.set('category', category);
    }
    return this.http.get(`${this.baseUrl}/gallery`, { params });
  }

  createGalleryItem(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/gallery`, data, { headers: this.getHeaders() });
  }

  deleteGalleryItem(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/gallery/${id}`, { headers: this.getHeaders() });
  }

  // ==========================================
  // TESTIMONIALS
  // ==========================================
  getTestimonials(): Observable<any> {
    return this.http.get(`${this.baseUrl}/testimonials`);
  }

  createTestimonial(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/testimonials`, data, { headers: this.getHeaders() });
  }

  updateTestimonial(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/testimonials/${id}`, data, { headers: this.getHeaders() });
  }

  deleteTestimonial(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/testimonials/${id}`, { headers: this.getHeaders() });
  }

  // ==========================================
  // FAQS
  // ==========================================
  getFaqs(): Observable<any> {
    return this.http.get(`${this.baseUrl}/faqs`);
  }

  createFaq(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/faqs`, data, { headers: this.getHeaders() });
  }

  updateFaq(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/faqs/${id}`, data, { headers: this.getHeaders() });
  }

  deleteFaq(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/faqs/${id}`, { headers: this.getHeaders() });
  }

  // ==========================================
  // CERTIFICATIONS
  // ==========================================
  getCertifications(): Observable<any> {
    return this.http.get(`${this.baseUrl}/certifications`);
  }

  createCertification(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/certifications`, data, { headers: this.getHeaders() });
  }

  updateCertification(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/certifications/${id}`, data, { headers: this.getHeaders() });
  }

  deleteCertification(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/certifications/${id}`, { headers: this.getHeaders() });
  }

  // ==========================================
  // COUNTRIES
  // ==========================================
  getCountries(): Observable<any> {
    return this.http.get(`${this.baseUrl}/countries`);
  }

  createCountry(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/countries`, data, { headers: this.getHeaders() });
  }

  updateCountry(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/countries/${id}`, data, { headers: this.getHeaders() });
  }

  deleteCountry(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/countries/${id}`, { headers: this.getHeaders() });
  }

  // ==========================================
  // STATISTICS
  // ==========================================
  getStatistics(): Observable<any> {
    return this.http.get(`${this.baseUrl}/statistics`);
  }

  updateStatistics(data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/statistics`, data, { headers: this.getHeaders() });
  }

  // ==========================================
  // COMPANY DETAILS
  // ==========================================
  getCompanyDetails(): Observable<any> {
    return this.http.get(`${this.baseUrl}/company`);
  }

  updateCompanyDetails(data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/company`, data, { headers: this.getHeaders() });
  }

  // ==========================================
  // IMAGE MASTER
  // ==========================================
  getImageMaster(): Observable<any> {
    return this.http.get(`${this.baseUrl}/images`);
  }

  createImageMaster(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/images`, data, { headers: this.getHeaders() });
  }

  updateImageMaster(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/images/${id}`, data, { headers: this.getHeaders() });
  }

  deleteImageMaster(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/images/${id}`, { headers: this.getHeaders() });
  }

  // ==========================================
  // FILE UPLOADS
  // ==========================================
  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('admin_token');
    const headers = new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });

    return this.http.post(`${this.baseUrl}/upload`, formData, { headers });
  }

  // ==========================================
  // USER QUOTES & INQUIRIES TRACKING
  // ==========================================
  getMyQuotes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/quotes/my-quotes`, { headers: this.getHeaders() });
  }

  getMyInquiries(): Observable<any> {
    return this.http.get(`${this.baseUrl}/inquiries/my-inquiries`, { headers: this.getHeaders() });
  }
}
