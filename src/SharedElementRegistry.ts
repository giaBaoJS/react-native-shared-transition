/**
 * SharedElementRegistry
 *
 * Global registry tracking every mounted `<SharedElement>`. The transition
 * coordinator subscribes to registration events to detect pairs (same id on
 * two screens) and to run return transitions when an element unmounts.
 */

import type { MeasuredFrame } from './specs/SharedTransitionModule.nitro';
import type { SharedElementId, SharedElementRecord } from './types';

export type RegistryEvent =
  | { type: 'registered'; record: SharedElementRecord }
  | { type: 'layout'; record: SharedElementRecord }
  | {
      type: 'unregistered';
      record: SharedElementRecord;
      /** Newest remaining record with the same id, if any. */
      remaining: SharedElementRecord | null;
    };

export type RegistryListener = (event: RegistryEvent) => void;

let sequenceCounter = 0;

class SharedElementRegistryImpl {
  /** All records keyed by nativeId. */
  private records = new Map<string, SharedElementRecord>();
  /** Records grouped by element id, in registration order. */
  private byId = new Map<SharedElementId, SharedElementRecord[]>();
  private listeners = new Set<RegistryListener>();

  /**
   * Register a mounted SharedElement. Returns the stored record.
   */
  register(
    record: Omit<SharedElementRecord, 'sequence' | 'lastFrame'>
  ): SharedElementRecord {
    const stored: SharedElementRecord = {
      ...record,
      sequence: ++sequenceCounter,
      lastFrame: null,
    };
    this.records.set(stored.nativeId, stored);
    const group = this.byId.get(stored.id) ?? [];
    group.push(stored);
    this.byId.set(stored.id, group);
    if (__DEV__ && group.length > 2) {
      // Two is the transition pair (source screen + destination screen).
      // Three or more means the id is not unique per screen, and the
      // coordinator will pair up whichever two registered most recently.
      console.warn(
        `[react-native-shared-transition] ${group.length} elements are mounted ` +
          `with the shared id "${stored.id}". An id must identify at most one ` +
          `element per screen, or transitions will pair the wrong elements.`
      );
    }
    this.emit({ type: 'registered', record: stored });
    return stored;
  }

  /**
   * Remove a record by nativeId.
   */
  unregister(nativeId: string): void {
    const record = this.records.get(nativeId);
    if (!record) return;
    this.records.delete(nativeId);
    const group = this.byId.get(record.id);
    if (group) {
      const next = group.filter((r) => r.nativeId !== nativeId);
      if (next.length === 0) {
        this.byId.delete(record.id);
      } else {
        this.byId.set(record.id, next);
      }
    }
    this.emit({
      type: 'unregistered',
      record,
      remaining: this.getNewest(record.id),
    });
  }

  /**
   * Mark a record as laid out (its wrapper received onLayout).
   */
  markLayoutReady(nativeId: string): void {
    const record = this.records.get(nativeId);
    if (!record || record.layoutReady) return;
    record.layoutReady = true;
    this.emit({ type: 'layout', record });
  }

  /**
   * Refresh the mutable clone/config fields on re-render.
   */
  update(
    nativeId: string,
    fields: Partial<
      Pick<
        SharedElementRecord,
        'element' | 'borderRadius' | 'borderWidth' | 'borderColor' | 'config'
      >
    >
  ): void {
    const record = this.records.get(nativeId);
    if (!record) return;
    Object.assign(record, fields);
  }

  /** Store the last measured frame (used for return transitions). */
  setLastFrame(nativeId: string, frame: MeasuredFrame): void {
    const record = this.records.get(nativeId);
    if (record) record.lastFrame = frame;
  }

  getRecord(nativeId: string): SharedElementRecord | null {
    return this.records.get(nativeId) ?? null;
  }

  /** All records for an element id, in registration order. */
  getRecords(id: SharedElementId): SharedElementRecord[] {
    return [...(this.byId.get(id) ?? [])];
  }

  /** The most recently registered record for an id. */
  getNewest(id: SharedElementId): SharedElementRecord | null {
    const group = this.byId.get(id);
    return group && group.length > 0 ? group[group.length - 1]! : null;
  }

  /**
   * The most recently registered record with the same id, excluding the
   * given one — i.e. the transition partner of a newly-mounted element.
   */
  getPartnerOf(record: SharedElementRecord): SharedElementRecord | null {
    const group = this.byId.get(record.id);
    if (!group) return null;
    for (let i = group.length - 1; i >= 0; i--) {
      if (group[i]!.nativeId !== record.nativeId) return group[i]!;
    }
    return null;
  }

  subscribe(listener: RegistryListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Remove everything (tests only). */
  clear(): void {
    this.records.clear();
    this.byId.clear();
  }

  private emit(event: RegistryEvent): void {
    for (const listener of [...this.listeners]) {
      try {
        listener(event);
      } catch (error) {
        console.error('[SharedElementRegistry] Listener error:', error);
      }
    }
  }
}

export const SharedElementRegistry = new SharedElementRegistryImpl();
export type SharedElementRegistryType = SharedElementRegistryImpl;
