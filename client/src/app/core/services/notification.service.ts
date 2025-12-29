import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationOptions {
  duration?: number;
  action?: string;
  type?: NotificationType;
}

const DEFAULT_DURATION = 4000;

const TYPE_TO_CLASS: Record<NotificationType, string> = {
  success: 'success-snackbar',
  error: 'error-snackbar',
  warning: 'warning-snackbar',
  info: 'info-snackbar',
};

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  /**
   * Show a success notification
   */
  success(message: string, options?: Omit<NotificationOptions, 'type'>): void {
    this.show(message, { ...options, type: 'success' });
  }

  /**
   * Show an error notification
   */
  error(message: string, options?: Omit<NotificationOptions, 'type'>): void {
    this.show(message, { ...options, type: 'error', duration: options?.duration ?? 6000 });
  }

  /**
   * Show a warning notification
   */
  warning(message: string, options?: Omit<NotificationOptions, 'type'>): void {
    this.show(message, { ...options, type: 'warning' });
  }

  /**
   * Show an info notification
   */
  info(message: string, options?: Omit<NotificationOptions, 'type'>): void {
    this.show(message, { ...options, type: 'info' });
  }

  /**
   * Show a notification with custom options
   */
  show(message: string, options: NotificationOptions = {}): void {
    const { duration = DEFAULT_DURATION, action = 'Dismiss', type = 'info' } = options;

    const config: MatSnackBarConfig = {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [TYPE_TO_CLASS[type]],
    };

    this.snackBar.open(message, action, config);
  }

  /**
   * Dismiss any currently showing notification
   */
  dismiss(): void {
    this.snackBar.dismiss();
  }
}
