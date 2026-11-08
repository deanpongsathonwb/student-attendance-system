/**
 * Client-Side Request Cancellation Manager
 * Manages AbortController instances to prevent out-of-order race conditions when users switch tabs or filters rapidly.
 */
class CancellableRequestManager {
  private controllers = new Map<string, AbortController>();

  /**
   * Get or create a new AbortSignal for a key, aborting any prior in-flight request for this key
   */
  getSignal(key: string): AbortSignal {
    const existing = this.controllers.get(key);
    if (existing) {
      existing.abort();
    }

    const controller = new AbortController();
    this.controllers.set(key, controller);
    return controller.signal;
  }

  /**
   * Abort in-flight request for a key
   */
  abort(key: string): void {
    const existing = this.controllers.get(key);
    if (existing) {
      existing.abort();
      this.controllers.delete(key);
    }
  }

  /**
   * Clean up a completed key
   */
  clear(key: string): void {
    this.controllers.delete(key);
  }
}

export const cancellableRequest = new CancellableRequestManager();
