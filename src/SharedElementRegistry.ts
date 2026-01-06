/**
 * SharedElementRegistry
 *
 * Global registry for tracking shared elements across screens.
 * Handles element registration, transition detection, and cleanup.
 *
 * Compatible with react-native-shared-element patterns.
 */

import type { SharedElementId, SharedElementNode } from './types';

/**
 * Callback for when elements change
 */
export type RegistryChangeCallback = (
  elementId: SharedElementId,
  nodes: SharedElementNode[]
) => void;

/**
 * Transition pair - two elements with the same ID
 */
export interface TransitionPair {
  /** The start element (usually from the source screen) */
  start: SharedElementNode;
  /** The end element (usually from the target screen) */
  end: SharedElementNode;
}

/**
 * Internal storage for registered elements
 */
interface RegisteredElement {
  node: SharedElementNode;
  timestamp: number;
}

/**
 * SharedElementRegistry class
 *
 * Singleton registry that tracks all SharedElement components.
 */
class SharedElementRegistryImpl {
  /**
   * Map of element ID to registered nodes
   * Multiple nodes can exist with the same ID (during transitions)
   */
  private elements: Map<SharedElementId, RegisteredElement[]> = new Map();

  /**
   * Subscribers for element changes
   */
  private subscribers: Set<RegistryChangeCallback> = new Set();

  /**
   * Register a new shared element
   */
  registerElement(id: SharedElementId, node: SharedElementNode): void {
    const existing = this.elements.get(id) || [];

    // Add new element with timestamp
    existing.push({
      node,
      timestamp: Date.now(),
    });

    this.elements.set(id, existing);

    // Notify subscribers
    this.notifySubscribers(id);
  }

  /**
   * Unregister a shared element
   */
  unregisterElement(id: SharedElementId, node: SharedElementNode): void {
    const existing = this.elements.get(id);
    if (!existing) return;

    // Remove the matching node
    const filtered = existing.filter((e) => e.node.nativeId !== node.nativeId);

    if (filtered.length === 0) {
      this.elements.delete(id);
    } else {
      this.elements.set(id, filtered);
    }

    // Notify subscribers
    this.notifySubscribers(id);
  }

  /**
   * Get all registered nodes for an element ID
   */
  getNodes(id: SharedElementId): SharedElementNode[] {
    const existing = this.elements.get(id);
    if (!existing) return [];

    // Sort by timestamp (oldest first)
    return [...existing]
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((e) => e.node);
  }

  /**
   * Get a transition pair for an element ID
   * Returns the oldest node as start and newest as end
   */
  getTransitionPair(id: SharedElementId): TransitionPair | null {
    const nodes = this.getNodes(id);

    if (nodes.length < 2) {
      return null;
    }

    const start = nodes[0];
    const end = nodes[nodes.length - 1];

    // TypeScript safety - this shouldn't happen given the length check
    if (!start || !end) {
      return null;
    }

    // First registered is start, last is end
    return { start, end };
  }

  /**
   * Check if a transition is possible for an element ID
   */
  hasTransitionPair(id: SharedElementId): boolean {
    return this.getTransitionPair(id) !== null;
  }

  /**
   * Get all element IDs that have transition pairs
   */
  getReadyTransitions(): SharedElementId[] {
    const ready: SharedElementId[] = [];

    this.elements.forEach((_, id) => {
      if (this.hasTransitionPair(id)) {
        ready.push(id);
      }
    });

    return ready;
  }

  /**
   * Get all transition pairs at once
   */
  getAllTransitionPairs(): Array<
    { elementId: SharedElementId } & TransitionPair
  > {
    const pairs: Array<{ elementId: SharedElementId } & TransitionPair> = [];

    this.elements.forEach((_, id) => {
      const pair = this.getTransitionPair(id);
      if (pair) {
        pairs.push({ elementId: id, ...pair });
      }
    });

    return pairs;
  }

  /**
   * Subscribe to element changes
   */
  subscribe(callback: RegistryChangeCallback): () => void {
    this.subscribers.add(callback);

    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Clear all registered elements
   */
  clear(): void {
    this.elements.clear();
    // Don't notify - this is usually for cleanup
  }

  /**
   * Notify subscribers of changes
   */
  private notifySubscribers(id: SharedElementId): void {
    const nodes = this.getNodes(id);

    this.subscribers.forEach((callback) => {
      try {
        callback(id, nodes);
      } catch (error) {
        console.warn('[SharedElementRegistry] Subscriber error:', error);
      }
    });
  }

  /**
   * Debug: Get all registered elements
   */
  debugGetAll(): Map<SharedElementId, SharedElementNode[]> {
    const result = new Map<SharedElementId, SharedElementNode[]>();

    this.elements.forEach((elements, id) => {
      result.set(
        id,
        elements.map((e) => e.node)
      );
    });

    return result;
  }
}

/**
 * Singleton instance of the registry
 */
export const SharedElementRegistry = new SharedElementRegistryImpl();

export default SharedElementRegistry;
