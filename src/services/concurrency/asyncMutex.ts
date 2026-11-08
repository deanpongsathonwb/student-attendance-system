/**
 * Client-Side Asynchronous Mutex Lock Manager
 * Prevents race conditions and duplicate concurrent writes for the same resource key.
 */
class AsyncMutexManager {
  private locks = new Map<string, Promise<void>>();

  /**
   * Check if a resource key is currently locked
   */
  isLocked(key: string): boolean {
    return this.locks.has(key);
  }

  /**
   * Acquire an exclusive lock for a resource key
   */
  async acquire(key: string): Promise<() => void> {
    while (this.locks.has(key)) {
      await this.locks.get(key);
    }

    let releaseLock: () => void = () => {};
    const lockPromise = new Promise<void>((resolve) => {
      releaseLock = () => {
        this.locks.delete(key);
        resolve();
      };
    });

    this.locks.set(key, lockPromise);
    return releaseLock;
  }

  /**
   * Run a critical section task with an exclusive lock
   */
  async withLock<T>(key: string, task: () => Promise<T>): Promise<T> {
    const release = await this.acquire(key);
    try {
      return await task();
    } finally {
      release();
    }
  }
}

export const asyncMutex = new AsyncMutexManager();
