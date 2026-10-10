import {
  Component,
  OnInit,
  signal,
  computed,
  effect,
  ElementRef,
  viewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export interface Part {
  make: string;
  model: string;
  year: number;
  part_category: string;
  part_name: string;
  brand: string;
  sku: string;
  part_number: string;
  price_usd: number;
  product_url: string;
  image_url: string;
  source: string;
  collected_at: string;
  tier: 'OEM (Genuine)' | 'Aftermarket';
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private http = inject(HttpClient);

  // Canvas elements for Chart.js
  trendCanvas = viewChild<ElementRef<HTMLCanvasElement>>('trendCanvas');
  brandCanvas = viewChild<ElementRef<HTMLCanvasElement>>('brandCanvas');

  private trendChart: Chart | null = null;
  private brandChart: Chart | null = null;

  // Raw dataset
  parts = signal<Part[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  // User Filter Signals
  selectedModel = signal<string>('C300');
  selectedYear = signal<number>(2018);
  selectedCategory = signal<string>('Brake Pads');
  selectedBrand = signal<string>('All');
  selectedTier = signal<string>('All'); // 'All' | 'OEM' | 'Aftermarket'
  searchQuery = signal<string>('');
  sortBy = signal<string>('price-asc');

  // Copied alert notification
  copyToast = signal<string | null>(null);

  // Derived unique lists
  models = computed(() => {
    const list = Array.from(new Set(this.parts().map((p) => p.model)));
    return list.sort();
  });

  years = computed(() => {
    const model = this.selectedModel();
    const list = Array.from(
      new Set(
        this.parts()
          .filter((p) => p.model === model)
          .map((p) => p.year)
      )
    );
    return list.sort();
  });

  categories = computed(() => {
    const list = Array.from(new Set(this.parts().map((p) => p.part_category)));
    return list.sort();
  });

  availableBrands = computed(() => {
    const subset = this.parts().filter(
      (p) =>
        p.model === this.selectedModel() &&
        p.year === this.selectedYear() &&
        p.part_category === this.selectedCategory()
    );
    const list = Array.from(new Set(subset.map((p) => p.brand)));
    return ['All', ...list.sort()];
  });

  // Filtered Parts
  filteredParts = computed(() => {
    let result = this.parts().filter(
      (p) =>
        p.model === this.selectedModel() &&
        p.year === this.selectedYear() &&
        p.part_category === this.selectedCategory()
    );

    if (this.selectedBrand() !== 'All') {
      result = result.filter((p) => p.brand === this.selectedBrand());
    }

    if (this.selectedTier() === 'OEM') {
      result = result.filter((p) => p.tier === 'OEM (Genuine)');
    } else if (this.selectedTier() === 'Aftermarket') {
      result = result.filter((p) => p.tier === 'Aftermarket');
    }

    const q = this.searchQuery().trim().toLowerCase();
    if (q) {
      result = result.filter(
        (p) =>
          p.part_name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          (p.part_number && p.part_number.toLowerCase().includes(q)) ||
          p.sku.toLowerCase().includes(q)
      );
    }

    // Sorting
    const sort = this.sortBy();
    return result.sort((a, b) => {
      if (sort === 'price-asc') return a.price_usd - b.price_usd;
      if (sort === 'price-desc') return b.price_usd - a.price_usd;
      if (sort === 'brand-asc') return a.brand.localeCompare(b.brand);
      return 0;
    });
  });

  // KPI Metrics
  kpiMetrics = computed(() => {
    const subset = this.parts().filter(
      (p) =>
        p.model === this.selectedModel() &&
        p.year === this.selectedYear() &&
        p.part_category === this.selectedCategory()
    );

    const oem = subset.filter((p) => p.tier === 'OEM (Genuine)');
    const aftermarket = subset.filter((p) => p.tier === 'Aftermarket');

    const oemMin = oem.length ? Math.min(...oem.map((p) => p.price_usd)) : null;
    const aftMin = aftermarket.length
      ? Math.min(...aftermarket.map((p) => p.price_usd))
      : null;

    let savingsAmount = 0;
    let savingsPct = 0;
    if (oemMin !== null && aftMin !== null && oemMin > aftMin) {
      savingsAmount = oemMin - aftMin;
      savingsPct = (savingsAmount / oemMin) * 100;
    }

    return {
      oemPrice: oemMin,
      aftermarketPrice: aftMin,
      savingsAmount,
      savingsPct,
      totalCount: this.filteredParts().length,
    };
  });

  constructor() {
    // Reactive effect to render/update charts whenever category, model, or filtered parts change
    effect(() => {
      const parts = this.parts();
      const currentCategory = this.selectedCategory();
      const currentModel = this.selectedModel();
      const currentFiltered = this.filteredParts();

      if (parts.length > 0) {
        setTimeout(() => {
          this.renderTrendChart(currentCategory);
          this.renderBrandChart(currentFiltered, currentModel);
        }, 50);
      }
    });
  }

  ngOnInit(): void {
    this.http.get<Part[]>('/parts_data.json').subscribe({
      next: (data) => {
        this.parts.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load parts_data.json', err);
        this.error.set('Failed to load parts data. Please ensure parts_data.json is present in /public.');
        this.loading.set(false);
      },
    });
  }

  // Calculate savings for an individual part vs OEM benchmark
  getSavingsVsOem(partPrice: number): number | null {
    const oemPrice = this.kpiMetrics().oemPrice;
    if (oemPrice !== null && partPrice < oemPrice) {
      return oemPrice - partPrice;
    }
    return null;
  }

  // Copy OEM Part number to clipboard
  copyPartNumber(num: string): void {
    if (!num || num === 'N/A') return;
    navigator.clipboard.writeText(num);
    this.copyToast.set(`Copied Part #: ${num}`);
    setTimeout(() => this.copyToast.set(null), 2500);
  }

  // Export filtered parts to CSV
  exportCsv(): void {
    const items = this.filteredParts();
    if (!items.length) return;

    const headers = [
      'Make',
      'Model',
      'Year',
      'Category',
      'Part Name',
      'Brand',
      'Tier',
      'Part Number',
      'SKU',
      'Price (USD)',
      'Retailer URL',
    ];

    const rows = items.map((p) => [
      `"${p.make}"`,
      `"${p.model}"`,
      p.year,
      `"${p.part_category}"`,
      `"${p.part_name.replace(/"/g, '""')}"`,
      `"${p.brand}"`,
      `"${p.tier}"`,
      `"${p.part_number}"`,
      `"${p.sku}"`,
      p.price_usd.toFixed(2),
      `"${p.product_url}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `mercedes_${this.selectedModel()}_${this.selectedYear()}_${this.selectedCategory().replace(/\s+/g, '_')}_parts.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Render Line Chart: Trend across vehicle platforms for current category
  private renderTrendChart(category: string): void {
    const canvasRef = this.trendCanvas();
    if (!canvasRef) return;

    const canvas = canvasRef.nativeElement;
    const catParts = this.parts().filter((p) => p.part_category === category);

    // Group by vehicle platform
    const platforms = Array.from(
      new Set(catParts.map((p) => `${p.year} ${p.model}`))
    ).sort();

    const oemPrices = platforms.map((plat) => {
      const subset = catParts.filter(
        (p) => `${p.year} ${p.model}` === plat && p.tier === 'OEM (Genuine)'
      );
      if (!subset.length) return null;
      const sum = subset.reduce((acc, p) => acc + p.price_usd, 0);
      return Math.round((sum / subset.length) * 100) / 100;
    });

    const aftPrices = platforms.map((plat) => {
      const subset = catParts.filter(
        (p) => `${p.year} ${p.model}` === plat && p.tier === 'Aftermarket'
      );
      if (!subset.length) return null;
      const sum = subset.reduce((acc, p) => acc + p.price_usd, 0);
      return Math.round((sum / subset.length) * 100) / 100;
    });

    if (this.trendChart) {
      this.trendChart.destroy();
    }

    this.trendChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: platforms,
        datasets: [
          {
            label: 'OEM (Genuine Mercedes)',
            data: oemPrices,
            borderColor: '#e11d48',
            backgroundColor: 'rgba(225, 29, 72, 0.1)',
            borderWidth: 3,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: '#e11d48',
            tension: 0.25,
            fill: false,
          },
          {
            label: 'Aftermarket Average',
            data: aftPrices,
            borderColor: '#0284c7',
            backgroundColor: 'rgba(2, 132, 199, 0.1)',
            borderWidth: 3,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: '#0284c7',
            tension: 0.25,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 16,
              font: { weight: 'bold', size: 12 },
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: $${Number(ctx.raw).toFixed(2)} USD`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            title: { display: true, text: 'Price (USD)' },
            grid: { color: '#f1f5f9' },
          },
          x: {
            grid: { display: false },
          },
        },
      },
    });
  }

  // Render Horizontal Bar Chart: Brand price distribution
  private renderBrandChart(items: Part[], model: string): void {
    const canvasRef = this.brandCanvas();
    if (!canvasRef) return;

    const canvas = canvasRef.nativeElement;
    const sorted = [...items].sort((a, b) => a.price_usd - b.price_usd);
    const labels = sorted.map((p) => p.brand);
    const data = sorted.map((p) => p.price_usd);
    const colors = sorted.map((p) =>
      p.tier === 'OEM (Genuine)' ? '#e11d48' : '#0284c7'
    );

    if (this.brandChart) {
      this.brandChart.destroy();
    }

    this.brandChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Price (USD)',
            data: data,
            backgroundColor: colors,
            borderRadius: 6,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `$${Number(ctx.raw).toFixed(2)} USD`,
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            title: { display: true, text: 'Price ($ USD)' },
            grid: { color: '#f1f5f9' },
          },
          y: {
            grid: { display: false },
          },
        },
      },
    });
  }
}
