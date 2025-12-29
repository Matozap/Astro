import { Injectable, signal, computed } from '@angular/core';

export interface LoadingState {
  key: string;
  message?: string;
  startedAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private readonly _loadingStates = signal<Map<string, LoadingState>>(new Map());

  /**
   * Check if any loading operation is in progress
   */
  readonly isLoading = computed(() => this._loadingStates().size > 0);

  /**
   * Get all current loading states
   */
  readonly loadingStates = computed(() => Array.from(this._loadingStates().values()));

  /**
   * Get the most recent loading message
   */
  readonly loadingMessage = computed(() => {
    const states = this.loadingStates();
    if (states.length === 0) return null;

    // Return the most recent loading message
    const latest = states.reduce((a, b) =>
      a.startedAt > b.startedAt ? a : b
    );
    return latest.message || 'Loading...';
  });

  /**
   * Start a loading operation
   * @param key Unique identifier for this loading operation
   * @param message Optional loading message to display
   */
  startLoading(key: string, message?: string): void {
    this._loadingStates.update((states) => {
      const newStates = new Map(states);
      newStates.set(key, {
        key,
        message,
        startedAt: new Date(),
      });
      return newStates;
    });
  }

  /**
   * Stop a loading operation
   * @param key Unique identifier for the loading operation to stop
   */
  stopLoading(key: string): void {
    this._loadingStates.update((states) => {
      const newStates = new Map(states);
      newStates.delete(key);
      return newStates;
    });
  }

  /**
   * Check if a specific operation is loading
   * @param key Unique identifier to check
   */
  isLoadingKey(key: string): boolean {
    return this._loadingStates().has(key);
  }

  /**
   * Clear all loading states
   */
  clearAll(): void {
    this._loadingStates.set(new Map());
  }

  /**
   * Execute an async operation with automatic loading state management
   * @param key Unique identifier for this operation
   * @param operation The async operation to execute
   * @param message Optional loading message
   */
  async withLoading<T>(
    key: string,
    operation: () => Promise<T>,
    message?: string
  ): Promise<T> {
    this.startLoading(key, message);
    try {
      return await operation();
    } finally {
      this.stopLoading(key);
    }
  }
}
