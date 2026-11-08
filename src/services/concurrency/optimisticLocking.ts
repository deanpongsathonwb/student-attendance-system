/**
 * Optimistic Concurrency Control (OCC)
 * Detects and resolves concurrent update conflicts (Lost Update problem) via version and timestamp stamping.
 */

export interface VersionMetadata {
  _version: number;
  _updatedAt: number;
}

export type Versioned<T> = T & VersionMetadata;

export const optimisticLocking = {
  createVersioned<T extends Record<string, unknown>>(data: T, initialVersion: number = 1): Versioned<T> {
    return {
      ...data,
      _version: initialVersion,
      _updatedAt: Date.now(),
    };
  },

  /**
   * Checks if an update can proceed safely without conflicting with a concurrent write
   */
  canUpdate(currentVersion: number, expectedVersion: number): boolean {
    return currentVersion === expectedVersion;
  },

  /**
   * Increments the version and updates timestamp
   */
  nextVersion<T extends Record<string, unknown>>(current: Versioned<T>): Versioned<T> {
    return {
      ...current,
      _version: current._version + 1,
      _updatedAt: Date.now(),
    };
  },
};
