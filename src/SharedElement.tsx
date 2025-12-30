import React, { useEffect, useRef, useCallback } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import type { SharedElementProps } from './types';
import { registry } from './SharedElementRegistry';
import {
  isNativeModuleAvailable,
  registerElement,
  unregisterElement,
} from './native/NativeModule';

/**
 * Marks a view as a shared element for automatic transitions.
 *
 * When multiple SharedElement components with the same `id` are mounted
 * (e.g., navigating between screens), the library automatically detects
 * and coordinates the transition.
 *
 * @example
 * // Screen A
 * <SharedElement id="hero-image">
 *   <Image source={photo} style={styles.thumbnail} />
 * </SharedElement>
 *
 * // Screen B (after navigation)
 * <SharedElement id="hero-image">
 *   <Image source={photo} style={styles.fullscreen} />
 * </SharedElement>
 *
 * // Transition happens automatically!
 */
export function SharedElement({
  id,
  children,
  style,
  disabled = false,
}: SharedElementProps): React.JSX.Element {
  const timestampRef = useRef<number>(Date.now());
  const nativeId = `shared-element-${id}`;

  // Register element on mount
  useEffect(() => {
    if (disabled) return;

    const timestamp = timestampRef.current;

    // Register with JS registry for automatic detection
    registry.register(id, null);

    // Register with native module for snapshot capture (if available)
    if (isNativeModuleAvailable()) {
      registerElement(nativeId, id);
    }

    return () => {
      registry.unregister(id, timestamp);

      if (isNativeModuleAvailable()) {
        unregisterElement(nativeId);
      }
    };
  }, [id, nativeId, disabled]);

  // Update layout when measured
  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      if (disabled) return;

      const { x, y, width, height } = event.nativeEvent.layout;
      const timestamp = timestampRef.current;

      registry.updateLayout(id, timestamp, { x, y, width, height });
    },
    [id, disabled]
  );

  return (
    <View
      style={style}
      onLayout={handleLayout}
      nativeID={nativeId}
      collapsable={false} // Prevent view flattening for snapshot capture
    >
      {children}
    </View>
  );
}
