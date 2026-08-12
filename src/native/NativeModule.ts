/**
 * Lazy bridge to the SharedTransition Nitro module.
 *
 * Loading is deferred so that importing the library never throws — apps
 * running without the native module (e.g. web, tests) degrade gracefully:
 * transitions simply do not run.
 */

import type {
  SharedTransitionModule,
  MeasuredFrame,
  SnapshotResult,
} from '../specs/SharedTransitionModule.nitro';

export type { MeasuredFrame, SnapshotResult };

let cachedModule: SharedTransitionModule | null | undefined;
let warned = false;

/**
 * Get the Nitro hybrid object, or `null` when unavailable.
 */
export function getNativeModule(): SharedTransitionModule | null {
  if (cachedModule === undefined) {
    try {
      const { NitroModules } =
        require('react-native-nitro-modules') as typeof import('react-native-nitro-modules');
      cachedModule = NitroModules.createHybridObject<SharedTransitionModule>(
        'SharedTransitionModule'
      );
    } catch (error) {
      cachedModule = null;
      if (__DEV__ && !warned) {
        warned = true;
        console.warn(
          '[react-native-shared-transition] Native module unavailable — ' +
            'transitions are disabled. Did you rebuild the app after installing?',
          error
        );
      }
    }
  }
  return cachedModule ?? null;
}

/** True when the Nitro module loaded successfully. */
export function isNativeModuleAvailable(): boolean {
  return getNativeModule() != null;
}

function requireModule(): SharedTransitionModule {
  const module = getNativeModule();
  if (!module) {
    throw new Error(
      '[react-native-shared-transition] Native module not available.'
    );
  }
  return module;
}

/** Measure a view's frame (window coordinates) by its nativeID. */
export function measureNode(nativeId: string): Promise<MeasuredFrame> {
  return requireModule().measureNode(nativeId);
}

/** Capture a PNG snapshot of the view with the given nativeID. */
export function captureSnapshot(nativeId: string): Promise<SnapshotResult> {
  return requireModule().captureSnapshot(nativeId);
}

/** Hide/show the original view while an overlay is in flight. */
export function setNodeHidden(nativeId: string, hidden: boolean): void {
  getNativeModule()?.setNodeHidden(nativeId, hidden);
}

/** Delete captured snapshots and re-show hidden views. */
export function cleanup(): void {
  getNativeModule()?.cleanup();
}
