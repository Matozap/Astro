import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatusBadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-badge" [class]="'variant-' + variant">
      {{ label }}
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: capitalize;
    }

    .variant-success {
      background-color: rgba(129, 199, 132, 0.15);
      color: #81c784;
    }

    .variant-warning {
      background-color: rgba(255, 183, 77, 0.15);
      color: #ffb74d;
    }

    .variant-error {
      background-color: rgba(229, 115, 115, 0.15);
      color: #e57373;
    }

    .variant-info {
      background-color: rgba(79, 195, 247, 0.15);
      color: #4fc3f7;
    }

    .variant-default {
      background-color: rgba(144, 164, 174, 0.15);
      color: #90a4ae;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  @Input({ required: true }) label!: string;
  @Input() variant: StatusBadgeVariant = 'default';
}
