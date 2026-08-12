/**
 * TransitionCoordinator
 *
 * Singleton that watches the SharedElementRegistry and orchestrates
 * transitions:
 *
 *  - Forward: a second element with an already-registered id mounts
 *    (screen push). Once the new element has layout, both endpoints are
 *    measured natively, the originals are hidden, and an overlay morphs
 *    from the source frame to the target frame.
 *  - Back: an element unmounts while a partner remains (screen pop). The
 *    overlay starts at the departed element's last known frame and morphs
 *    back to the remaining element.
 *  - Interruption: starting a transition for an id that is already in
 *    flight retargets the existing overlay — springs continue smoothly
 *    from their current values instead of jumping.
 *
 * Rendering is done by `<SharedTransitionHost>`, which subscribes to this
 * coordinator via `useSyncExternalStore`.
 */

import type { ReactElement } from 'react';

import { getNativeModule } from './native/NativeModule';
import type {
  MeasuredFrame,
  SharedTransitionModule,
} from './specs/SharedTransitionModule.nitro';
import { SharedElementRegistry } from './SharedElementRegistry';
import type { RegistryEvent } from './SharedElementRegistry';
import { resolveTransitionConfig, DEFAULT_TRANSITION_CONFIG } from './types';
import type {
  SharedElementId,
  SharedElementRecord,
  SharedTransitionConfig,
  SharedTransitionConfigInput,
} from './types';

export type TransitionDirection = 'forward' | 'back';

export interface TransitionEntry {
  /** Stable key of the overlay instance (kept across retargets). */
  key: string;
  id: SharedElementId;
  direction: TransitionDirection;
  /** Clone template shown in the overlay (target element). */
  content: ReactElement | null;
  /** Source clone template rendered underneath when cross-fading. */
  fadeContent: ReactElement | null;
  from: MeasuredFrame;
  fromRadius: number;
  to: MeasuredFrame;
  toRadius: number;
  /** Static border drawn on the overlay container. */
  borderWidth: number;
  borderColor: string | undefined;
  config: SharedTransitionConfig;
  /** Bumped on every (re)target; guards stale completions. */
  generation: number;
  /** nativeIDs to hide once the overlay is mounted. */
  hideOnMount: string[];
}

interface PendingStart {
  id: SharedElementId;
  fromNativeId: string;
  toNativeId: string;
  timer: ReturnType<typeof setTimeout>;
}

const LAYOUT_WAIT_TIMEOUT_MS = 600;
const MEASURE_RETRY_ATTEMPTS = 12;

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

async function measureWithRetry(
  native: SharedTransitionModule,
  nativeId: string
): Promise<MeasuredFrame | null> {
  for (let attempt = 0; attempt < MEASURE_RETRY_ATTEMPTS; attempt++) {
    try {
      const frame = await native.measureNode(nativeId);
      if (frame.width > 0 && frame.height > 0) {
        return frame;
      }
    } catch {
      // View not mounted natively yet — retry next frame.
    }
    await nextFrame();
  }
  return null;
}

type StateListener = (id: SharedElementId, active: boolean) => void;

class TransitionCoordinatorImpl {
  private defaultConfig: SharedTransitionConfigInput | undefined;

  private entries = new Map<SharedElementId, TransitionEntry>();
  private cachedEntryList: TransitionEntry[] = [];
  private cacheDirty = false;

  private listeners = new Set<() => void>();
  private stateListeners = new Set<StateListener>();

  private pending = new Map<string, PendingStart>();
  /** nativeIDs hidden per element id, restored on finalize. */
  private hiddenById = new Map<SharedElementId, Set<string>>();

  private attachCount = 0;
  private unsubscribeRegistry: (() => void) | null = null;
  private keyCounter = 0;
  private generationCounter = 0;

  // ===========================================================================
  // Host lifecycle
  // ===========================================================================

  attach(defaultConfig?: SharedTransitionConfigInput): void {
    this.attachCount += 1;
    if (defaultConfig !== undefined) {
      this.defaultConfig = defaultConfig;
    }
    if (this.attachCount === 1) {
      this.unsubscribeRegistry = SharedElementRegistry.subscribe(
        this.onRegistryEvent
      );
    }
  }

  setDefaultConfig(config: SharedTransitionConfigInput | undefined): void {
    this.defaultConfig = config;
  }

  detach(): void {
    this.attachCount = Math.max(0, this.attachCount - 1);
    if (this.attachCount === 0) {
      this.unsubscribeRegistry?.();
      this.unsubscribeRegistry = null;
      for (const pending of this.pending.values()) {
        clearTimeout(pending.timer);
      }
      this.pending.clear();
      for (const id of [...this.entries.keys()]) {
        this.removeEntry(id);
      }
      this.hiddenById.clear();
      try {
        getNativeModule()?.cleanup();
      } catch {
        // Native side unavailable — nothing to clean.
      }
    }
  }

  // ===========================================================================
  // Store interface (useSyncExternalStore)
  // ===========================================================================

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getEntries = (): TransitionEntry[] => {
    if (this.cacheDirty) {
      this.cachedEntryList = [...this.entries.values()];
      this.cacheDirty = false;
    }
    return this.cachedEntryList;
  };

  /** Subscribe to per-id transition start/end events (for hooks). */
  subscribeState(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  getActiveIds(): SharedElementId[] {
    return [...this.entries.keys()];
  }

  isActive(id?: SharedElementId): boolean {
    return id === undefined ? this.entries.size > 0 : this.entries.has(id);
  }

  // ===========================================================================
  // Registry event handling
  // ===========================================================================

  private onRegistryEvent = (event: RegistryEvent): void => {
    switch (event.type) {
      case 'registered':
        this.handleRegistered(event.record);
        break;
      case 'layout':
        this.handleLayout(event.record);
        break;
      case 'unregistered':
        this.handleUnregistered(event.record, event.remaining);
        break;
    }
  };

  private handleRegistered(record: SharedElementRecord): void {
    const partner = SharedElementRegistry.getPartnerOf(record);
    if (!partner) return;

    if (record.layoutReady) {
      void this.begin(partner, record, 'forward');
      return;
    }
    // Wait for the new element's first layout before measuring.
    const timer = setTimeout(() => {
      this.pending.delete(record.nativeId);
    }, LAYOUT_WAIT_TIMEOUT_MS);
    this.pending.set(record.nativeId, {
      id: record.id,
      fromNativeId: partner.nativeId,
      toNativeId: record.nativeId,
      timer,
    });
  }

  private handleLayout(record: SharedElementRecord): void {
    const pending = this.pending.get(record.nativeId);
    if (!pending) return;
    clearTimeout(pending.timer);
    this.pending.delete(record.nativeId);
    const from = SharedElementRegistry.getRecord(pending.fromNativeId);
    if (!from) return;
    void this.begin(from, record, 'forward');
  }

  private handleUnregistered(
    record: SharedElementRecord,
    remaining: SharedElementRecord | null
  ): void {
    // Cancel pending starts that involve the departed element.
    for (const [key, pending] of [...this.pending.entries()]) {
      if (
        pending.toNativeId === record.nativeId ||
        pending.fromNativeId === record.nativeId
      ) {
        clearTimeout(pending.timer);
        this.pending.delete(key);
      }
    }

    if (remaining && record.lastFrame) {
      // Screen pop — run the return transition using the departed
      // element's last known frame as the starting point.
      void this.begin(record, remaining, 'back');
    } else if (!remaining) {
      // Everything for this id is gone — drop any overlay immediately.
      const entry = this.entries.get(record.id);
      if (entry) {
        this.finalize(record.id, entry.generation);
      }
    }
  }

  // ===========================================================================
  // Transition lifecycle
  // ===========================================================================

  private async begin(
    fromRecord: SharedElementRecord,
    toRecord: SharedElementRecord,
    direction: TransitionDirection
  ): Promise<void> {
    const id = toRecord.id;
    const native = getNativeModule();
    if (!native) return;

    const generation = ++this.generationCounter;

    let fromFrame: MeasuredFrame | null = null;
    if (direction === 'back') {
      fromFrame = fromRecord.lastFrame;
    } else {
      const existing = this.entries.get(id);
      if (existing) {
        // Retarget mid-flight: the overlay continues from wherever it is —
        // the `from` frame is only used on first mount of the overlay.
        fromFrame = existing.from;
      } else {
        fromFrame = await native
          .measureNode(fromRecord.nativeId)
          .catch(() => fromRecord.lastFrame);
      }
    }

    const toFrame = await measureWithRetry(native, toRecord.nativeId);

    // Bail out if this start was superseded while measuring.
    const current = this.entries.get(id);
    if (current && current.generation > generation) return;
    if (!SharedElementRegistry.getRecord(toRecord.nativeId)) return;
    if (!fromFrame || !toFrame) return;

    SharedElementRegistry.setLastFrame(toRecord.nativeId, toFrame);
    if (direction === 'forward') {
      SharedElementRegistry.setLastFrame(fromRecord.nativeId, fromFrame);
    }

    const config = resolveTransitionConfig(
      this.defaultConfig,
      fromRecord.config,
      toRecord.config
    );

    const hideOnMount = [toRecord.nativeId];
    // Hide the source too: on forward it stays mounted underneath; on back
    // the dying screen may still be rendering during dismissal.
    hideOnMount.push(fromRecord.nativeId);

    const entry: TransitionEntry = {
      key: current?.key ?? `transition-${++this.keyCounter}`,
      id,
      direction,
      content: toRecord.element ?? fromRecord.element,
      fadeContent: config.crossFade ? fromRecord.element : null,
      from: fromFrame,
      fromRadius: fromRecord.borderRadius,
      to: toFrame,
      toRadius: toRecord.borderRadius,
      borderWidth: toRecord.borderWidth,
      borderColor: toRecord.borderColor,
      config,
      generation,
      hideOnMount,
    };

    const wasActive = this.entries.has(id);
    this.entries.set(id, entry);
    this.emitChange();
    if (!wasActive) {
      this.emitState(id, true);
    }
  }

  /**
   * Called by the overlay view once it is mounted/retargeted — only now are
   * the original views hidden, so there is never an empty-frame gap.
   */
  handleOverlayReady(id: SharedElementId, generation: number): void {
    const entry = this.entries.get(id);
    if (!entry || entry.generation !== generation) return;
    const native = getNativeModule();
    if (!native) return;
    const hidden = this.hiddenById.get(id) ?? new Set<string>();
    for (const nativeId of entry.hideOnMount) {
      try {
        native.setNodeHidden(nativeId, true);
        hidden.add(nativeId);
      } catch {
        // View may be gone already.
      }
    }
    this.hiddenById.set(id, hidden);
  }

  /** Called by the overlay view when its animation settles. */
  handleComplete(id: SharedElementId, generation: number): void {
    this.finalize(id, generation);
  }

  private finalize(id: SharedElementId, generation: number): void {
    const entry = this.entries.get(id);
    if (!entry || entry.generation !== generation) return;

    const native = getNativeModule();
    const hidden = this.hiddenById.get(id);
    if (native && hidden) {
      for (const nativeId of hidden) {
        // Only re-show elements that are still mounted — elements on dying
        // screens stay hidden so they don't flash during dismissal.
        if (SharedElementRegistry.getRecord(nativeId)) {
          try {
            native.setNodeHidden(nativeId, false);
          } catch {
            // Ignore — nothing to restore.
          }
        }
      }
    }
    this.hiddenById.delete(id);

    // Reveal happened above; remove the overlay on the next frame so the
    // hand-off never shows an empty frame.
    requestAnimationFrame(() => {
      const currentEntry = this.entries.get(id);
      if (currentEntry && currentEntry.generation === generation) {
        this.removeEntry(id);
      }
    });
  }

  private removeEntry(id: SharedElementId): void {
    if (!this.entries.delete(id)) return;
    this.emitChange();
    this.emitState(id, false);
  }

  // ===========================================================================
  // Emitters
  // ===========================================================================

  private emitChange(): void {
    this.cacheDirty = true;
    for (const listener of [...this.listeners]) {
      listener();
    }
  }

  private emitState(id: SharedElementId, active: boolean): void {
    for (const listener of [...this.stateListeners]) {
      try {
        listener(id, active);
      } catch (error) {
        console.error('[TransitionCoordinator] State listener error:', error);
      }
    }
  }
}

export const TransitionCoordinator = new TransitionCoordinatorImpl();
export type TransitionCoordinatorType = TransitionCoordinatorImpl;
export { DEFAULT_TRANSITION_CONFIG };
