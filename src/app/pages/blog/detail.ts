import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detail.html',
  styleUrl: './detail.scss'
})
export class BlogDetailComponent implements OnInit {
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);

  blog = signal<any>(null);
  loading = signal(true);

  ngOnInit() {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      if (slug) {
        this.loadBlogDetails(slug);
      }
    });
  }

  loadBlogDetails(slug: string) {
    this.loading.set(true);
    this.apiService.getBlogBySlug(slug).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.status === 'success') {
          this.blog.set(res.data);
        }
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Failed to load blog post:', err);
      }
    });
  }
}
