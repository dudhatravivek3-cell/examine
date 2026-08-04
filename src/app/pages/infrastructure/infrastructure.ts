import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-infrastructure',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './infrastructure.html',
  styleUrl: './infrastructure.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfrastructureComponent implements OnInit {
  imagesMap = signal<{ [key: string]: string }>({});
  private apiService = inject(ApiService);

  ngOnInit() {
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
}

