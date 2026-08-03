import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-blog-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './blog.html',
  styleUrl: './blog.css'
})
export class BlogComponent implements OnInit {
  private apiService = inject(ApiService);
  blogs = signal<any[]>([]);

  ngOnInit() {
    this.loadBlogs();
  }

  loadBlogs() {
    this.apiService.getBlogs().subscribe({
      next: (res) => {
        if (res.status === 'success' && res.data) {
          this.blogs.set(res.data);
        }
      }
    });
  }
}
