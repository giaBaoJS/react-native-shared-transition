import type {
  SharedElementId,
  SharedElementEntry,
  ElementLayout,
} from './types';

/**
 * Global registry for tracking active shared elements.
 * Enables automatic transition detection when elements with matching IDs appear/disappear.
 * @internal
 */
class SharedElementRegistry {
  private elements = new Map<SharedElementId, SharedElementEntry[]>();
  private listeners = new Set<(id: SharedElementId) => void>();

  /**
   * Register a shared element
   */
  register(id: SharedElementId, layout: ElementLayout | null): void {
    const entries = this.elements.get(id) || [];
    const entry: SharedElementEntry = {
      id,
      layout,
      timestamp: Date.now(),
    };

    entries.push(entry);
    this.elements.set(id, entries);

    // Notify listeners when multiple elements with same ID are registered
    if (entries.length > 1) {
      this.notifyListeners(id);
    }
  }

  /**
   * Unregister a shared element
   */
  unregister(id: SharedElementId, timestamp: number): void {
    const entries = this.elements.get(id);
    if (!entries) return;

    const filtered = entries.filter((e) => e.timestamp !== timestamp);

    if (filtered.length === 0) {
      this.elements.delete(id);
    } else {
      this.elements.set(id, filtered);
    }
  }

  /**
   * Update layout for a registered element
   */
  updateLayout(
    id: SharedElementId,
    timestamp: number,
    layout: ElementLayout
  ): void {
    const entries = this.elements.get(id);
    if (!entries) return;

    const entry = entries.find((e) => e.timestamp === timestamp);
    if (entry) {
      entry.layout = layout;
    }
  }

  /**
   * Get all registered elements with a specific ID
   */
  getElements(id: SharedElementId): SharedElementEntry[] {
    return this.elements.get(id) || [];
  }

  /**
   * Get the most recent element with a specific ID
   */
  getLatest(id: SharedElementId): SharedElementEntry | null {
    const entries = this.getElements(id);
    if (entries.length === 0) return null;

    return entries.reduce((latest, current) =>
      current.timestamp > latest.timestamp ? current : latest
    );
  }

  /**
   * Get source and target for a transition (if both exist)
   */
  getTransitionPair(id: SharedElementId): {
    source: SharedElementEntry;
    target: SharedElementEntry;
  } | null {
    const entries = this.getElements(id);
    if (entries.length < 2) return null;

    // Sort by timestamp
    const sorted = [...entries].sort((a, b) => a.timestamp - b.timestamp);

    const source = sorted[0];
    const target = sorted[sorted.length - 1];

    if (!source || !target) return null;

    return { source, target };
  }

  /**
   * Subscribe to element registration changes
   */
  subscribe(listener: (id: SharedElementId) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(id: SharedElementId): void {
    this.listeners.forEach((listener) => listener(id));
  }

  /**
   * Clear all registered elements (useful for testing)
   */
  clear(): void {
    this.elements.clear();
  }
}

/**
 * Global singleton instance
 */
export const registry = new SharedElementRegistry();
