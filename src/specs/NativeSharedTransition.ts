/**
 * TurboModule Spec for SharedTransition
 *
 * This is the fallback for projects that don't have Nitro Modules installed.
 * It provides the same functionality but uses the standard TurboModule API.
 */
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

/**
 * Layout measurement (matches Nitro spec)
 */
export interface NativeLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Node measurement data
 */
export interface NativeNodeData {
  layout: NativeLayout;
  contentType: 'auto' | 'image' | 'snapshot';
  snapshotUri: string;
}

/**
 * Transition config (matches Nitro spec)
 */
export interface NativeTransitionConfig {
  animation: 'move' | 'fade' | 'fade-in' | 'fade-out';
  resize: 'auto' | 'stretch' | 'clip' | 'none';
  align: string;
  debug: boolean;
}

/**
 * Prepared transition data
 */
export interface NativePreparedTransition {
  startLayout: NativeLayout;
  endLayout: NativeLayout;
  startSnapshotUri: string;
  endSnapshotUri: string;
  startContentType: 'auto' | 'image' | 'snapshot';
  endContentType: 'auto' | 'image' | 'snapshot';
}

/**
 * TurboModule interface for SharedTransition
 */
export interface Spec extends TurboModule {
  /**
   * Measure a node by its nativeID
   */
  measureNode(nativeId: string): Promise<NativeNodeData>;

  /**
   * Capture a snapshot of a node
   */
  captureSnapshot(nativeId: string): Promise<string>;

  /**
   * Prepare a transition between two nodes
   */
  prepareTransition(
    startNodeId: string,
    endNodeId: string,
    config: NativeTransitionConfig
  ): Promise<NativePreparedTransition>;

  /**
   * Create a clone view for transition
   */
  createCloneView(nativeId: string): Promise<number>;

  /**
   * Destroy a clone view
   */
  destroyCloneView(viewTag: number): void;

  /**
   * Hide/show the original node
   */
  setNodeHidden(nativeId: string, hidden: boolean): void;

  /**
   * Clean up resources
   */
  cleanup(): void;
}

/**
 * Get the TurboModule (nullable for detection)
 */
export default TurboModuleRegistry.get<Spec>('SharedTransition');
