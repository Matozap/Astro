import { Injectable, signal, computed } from '@angular/core';
import { ApolloError } from '@apollo/client/core';

export interface AppError {
  id: string;
  message: string;
  type: 'network' | 'graphql' | 'validation' | 'unknown';
  timestamp: Date;
  details?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  private readonly _errors = signal<AppError[]>([]);

  readonly errors = this._errors.asReadonly();
  readonly hasErrors = computed(() => this._errors().length > 0);
  readonly latestError = computed(() => this._errors()[0] ?? null);

  /**
   * Handle an Apollo GraphQL error
   */
  handleApolloError(error: ApolloError): AppError {
    let type: AppError['type'] = 'unknown';
    let message = 'An unexpected error occurred';
    let details: string | undefined;

    if (error.networkError) {
      type = 'network';
      message = 'Network error. Please check your connection.';
      details = error.networkError.message;
    } else if (error.graphQLErrors?.length > 0) {
      type = 'graphql';
      const firstError = error.graphQLErrors[0];
      message = this.getUserFriendlyMessage(firstError.message);
      details = JSON.stringify(error.graphQLErrors);
    }

    return this.addError(message, type, details);
  }

  /**
   * Handle a generic error
   */
  handleError(error: unknown): AppError {
    let message = 'An unexpected error occurred';
    let details: string | undefined;

    if (error instanceof Error) {
      message = this.getUserFriendlyMessage(error.message);
      details = error.stack;
    } else if (typeof error === 'string') {
      message = this.getUserFriendlyMessage(error);
    }

    return this.addError(message, 'unknown', details);
  }

  /**
   * Add an error to the list
   */
  addError(
    message: string,
    type: AppError['type'] = 'unknown',
    details?: string
  ): AppError {
    const error: AppError = {
      id: this.generateId(),
      message,
      type,
      timestamp: new Date(),
      details,
    };

    this._errors.update((errors) => [error, ...errors.slice(0, 9)]); // Keep last 10 errors

    return error;
  }

  /**
   * Clear a specific error by ID
   */
  clearError(id: string): void {
    this._errors.update((errors) => errors.filter((e) => e.id !== id));
  }

  /**
   * Clear all errors
   */
  clearAllErrors(): void {
    this._errors.set([]);
  }

  /**
   * Convert technical error messages to user-friendly messages
   */
  private getUserFriendlyMessage(technicalMessage: string): string {
    const messageMap: Record<string, string> = {
      'Network request failed': 'Unable to connect to the server. Please try again.',
      'Failed to fetch': 'Unable to load data. Please check your connection.',
      'Unauthorized': 'Your session has expired. Please log in again.',
      'Forbidden': 'You do not have permission to perform this action.',
      'Not found': 'The requested resource was not found.',
      'Internal server error': 'A server error occurred. Please try again later.',
    };

    // Check for known patterns
    for (const [pattern, friendlyMessage] of Object.entries(messageMap)) {
      if (technicalMessage.toLowerCase().includes(pattern.toLowerCase())) {
        return friendlyMessage;
      }
    }

    // Return original message if it seems user-friendly (short and no technical terms)
    if (technicalMessage.length < 100 && !technicalMessage.includes('Error:')) {
      return technicalMessage;
    }

    return 'An error occurred. Please try again.';
  }

  private generateId(): string {
    return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
