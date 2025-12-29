import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

export type MetricCardVariant = 'primary' | 'success' | 'warning' | 'error' | 'info';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule, DecimalPipe, MatCardModule, MatIconModule],
  templateUrl: './metric-card.component.html',
  styleUrl: './metric-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricCardComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) value!: string | number;
  @Input() icon = 'analytics';
  @Input() change?: number;
  @Input() changeLabel = 'vs last month';
  @Input() variant: MetricCardVariant = 'primary';
  @Input() prefix = '';
  @Input() suffix = '';
  @Input() loading = false;

  get isPositiveChange(): boolean {
    return this.change !== undefined && this.change >= 0;
  }

  get changeIcon(): string {
    return this.isPositiveChange ? 'trending_up' : 'trending_down';
  }

  get formattedValue(): string {
    if (typeof this.value === 'number') {
      return this.prefix + this.value.toLocaleString() + this.suffix;
    }
    return this.prefix + this.value + this.suffix;
  }
}
