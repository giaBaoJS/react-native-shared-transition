/**
 * Native Module Bridge
 *
 * Handles detection and usage of either:
 * 1. Nitro Modules (preferred, faster)
 * 2. TurboModules (fallback)
 *
 * This allows the library to work in projects with or without Nitro.
 */

import type {
  SharedTransitionModule,
  SharedElementLayout,
  SharedElementNodeData,
  PreparedTransitionData,
  TransitionConfig,
  SharedElementAnimation,
  SharedElementResize,
  SharedElementAlign,
  SharedElementContentType,
} from '../specs/SharedTransitionModule.nitro';

import type {
  NativeLayout,
  NativeNodeData,
  NativePreparedTransition,
  NativeTransitionConfig,
} from '../specs/NativeSharedTransition';

// Re-export types for public use
export type {
  SharedElementLayout,
  SharedElementNodeData,
  PreparedTransitionData,
  TransitionConfig,
  SharedElementAnimation,
  SharedElementResize,
  SharedElementAlign,
  SharedElementContentType,
};

/**
 * Module type enum for detection
 */
export type NativeModuleType = 'nitro' | 'turbo' | 'none';

/**
 * Cached module instances
 */
let nitroModule: SharedTransitionModule | null = null;
let turboModule: typeof import('../specs/NativeSharedTransition').default | null =
  null;
let moduleType: NativeModuleType | null = null;

/**
 * Try to load Nitro Module
 */
function tryLoadNitroModule(): SharedTransitionModule | null {
  try {
    // Dynamic import to avoid crash if not installed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const NitroModules = require('react-native-nitro-modules').NitroModules;
    const module = NitroModules.createHybridObject(
      'SharedTransitionModule'
    ) as SharedTransitionModule;
    return module;
  } catch {
    return null;
  }
}

/**
 * Try to load TurboModule
 */
function tryLoadTurboModule(): typeof turboModule {
  try {
    return require('../specs/NativeSharedTransition').default;
  } catch {
    return null;
  }
}

/**
 * Initialize and detect available module
 */
function initializeModule(): void {
  if (moduleType !== null) return;

  // Try Nitro first (preferred)
  nitroModule = tryLoadNitroModule();
  if (nitroModule) {
    moduleType = 'nitro';
    return;
  }

  // Fall back to TurboModule
  turboModule = tryLoadTurboModule();
  if (turboModule) {
    moduleType = 'turbo';
    return;
  }

  // No native module available
  moduleType = 'none';
}

/**
 * Get the detected module type
 */
export function getModuleType(): NativeModuleType {
  initializeModule();
  return moduleType!;
}

/**
 * Check if native module is available
 */
export function isNativeModuleAvailable(): boolean {
  return getModuleType() !== 'none';
}

/**
 * Check if using Nitro (for feature detection)
 */
export function isUsingNitro(): boolean {
  return getModuleType() === 'nitro';
}

// =============================================================================
// Unified API - works with both Nitro and TurboModule
// =============================================================================

/**
 * Convert Turbo layout to shared layout
 */
function convertLayout(layout: NativeLayout): SharedElementLayout {
  return {
    x: layout.x,
    y: layout.y,
    width: layout.width,
    height: layout.height,
  };
}

/**
 * Convert Turbo node data to shared node data
 */
function convertNodeData(data: NativeNodeData): SharedElementNodeData {
  return {
    layout: convertLayout(data.layout),
    contentType: data.contentType as SharedElementContentType,
    snapshotUri: data.snapshotUri,
  };
}

/**
 * Convert shared config to Turbo config
 */
function convertConfig(config: TransitionConfig): NativeTransitionConfig {
  return {
    animation: config.animation,
    resize: config.resize,
    align: config.align,
    debug: config.debug,
  };
}

/**
 * Convert Turbo prepared transition to shared
 */
function convertPreparedTransition(
  data: NativePreparedTransition
): PreparedTransitionData {
  return {
    startLayout: convertLayout(data.startLayout),
    endLayout: convertLayout(data.endLayout),
    startSnapshotUri: data.startSnapshotUri,
    endSnapshotUri: data.endSnapshotUri,
    startContentType: data.startContentType as SharedElementContentType,
    endContentType: data.endContentType as SharedElementContentType,
  };
}

/**
 * Measure a node by its nativeID
 */
export async function measureNode(
  nativeId: string
): Promise<SharedElementNodeData> {
  initializeModule();

  if (nitroModule) {
    return nitroModule.measureNode(nativeId);
}

  if (turboModule) {
    const result = await turboModule.measureNode(nativeId);
    return convertNodeData(result);
  }

  throw new Error(
    '[SharedTransition] Native module not available. Install react-native-nitro-modules or ensure TurboModules are enabled.'
  );
}

/**
 * Capture a snapshot of a node
 */
export async function captureSnapshot(nativeId: string): Promise<string> {
  initializeModule();

  if (nitroModule) {
    return nitroModule.captureSnapshot(nativeId);
  }

  if (turboModule) {
    return turboModule.captureSnapshot(nativeId);
  }

  throw new Error('[SharedTransition] Native module not available.');
}

/**
 * Prepare a transition between two elements
 */
export async function prepareTransition(
  startNodeId: string,
  endNodeId: string,
  config: TransitionConfig
): Promise<PreparedTransitionData> {
  initializeModule();

  if (nitroModule) {
    return nitroModule.prepareTransition(startNodeId, endNodeId, config);
}

  if (turboModule) {
    const result = await turboModule.prepareTransition(
      startNodeId,
      endNodeId,
      convertConfig(config)
    );
    return convertPreparedTransition(result);
  }

  throw new Error('[SharedTransition] Native module not available.');
}

/**
 * Create a clone view for the transition overlay
 */
export async function createCloneView(nativeId: string): Promise<number> {
  initializeModule();

  if (nitroModule) {
    return nitroModule.createCloneView(nativeId);
  }

  if (turboModule) {
    return turboModule.createCloneView(nativeId);
  }

  throw new Error('[SharedTransition] Native module not available.');
}

/**
 * Destroy a clone view
 */
export function destroyCloneView(viewTag: number): void {
  initializeModule();

  if (nitroModule) {
    nitroModule.destroyCloneView(viewTag);
    return;
  }

  if (turboModule) {
    turboModule.destroyCloneView(viewTag);
    return;
  }
}

/**
 * Hide/show the original element during transition
 */
export function setNodeHidden(nativeId: string, hidden: boolean): void {
  initializeModule();

  if (nitroModule) {
    nitroModule.setNodeHidden(nativeId, hidden);
    return;
  }

  if (turboModule) {
    turboModule.setNodeHidden(nativeId, hidden);
    return;
  }
}

/**
 * Clean up all cached resources
 */
export function cleanup(): void {
  initializeModule();

  if (nitroModule) {
    nitroModule.cleanup();
    return;
  }

  if (turboModule) {
    turboModule.cleanup();
    return;
  }
}
