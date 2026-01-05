/**
 * SharedElement Component
 *
 * Wraps a child component and registers it for shared element transitions.
 * Compatible with react-native-shared-element API.
 *
 * Usage:
 * ```tsx
 * <SharedElement id="hero-image">
 *   <Image source={hero.photo} />
 * </SharedElement>
 * ```
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import type { ViewStyle, StyleProp } from 'react-native';

import type { SharedElementId, SharedElementNode, SharedElementProps } from './types';
import { SharedElementRegistry } from './SharedElementRegistry';

// Counter for generating unique native IDs
let nativeIdCounter = 0;

/**
 * Generate a unique native ID for a SharedElement instance
 */
function generateNativeId(transitionId: SharedElementId): string {
  nativeIdCounter += 1;
  return `shared-element-${transitionId}-${nativeIdCounter}`;
}

/**
 * SharedElement Component
 *
 * Wraps children and provides the node reference for transitions.
 */
export function SharedElement({
  id,
  style,
  children,
  onNode,
}: SharedElementProps) {
  // Generate stable nativeId for this instance
  const nativeId = useMemo(() => generateNativeId(id), [id]);

  // Ref for the view - using any type to avoid React Native type complexity
  const viewRef = useRef<any>(null);

  // Track if component is mounted
  const mountedRef = useRef(true);

  // Create node object
  const node = useMemo<SharedElementNode>(
    () => ({
      nativeId,
      transitionId: id,
    }),
    [nativeId, id]
  );

  // Register/unregister with global registry
  useEffect(() => {
    mountedRef.current = true;

    // Register this element
    SharedElementRegistry.registerElement(id, node);

    // Notify callback
    onNode?.(node);

    return () => {
      mountedRef.current = false;

      // Unregister on unmount
      SharedElementRegistry.unregisterElement(id, node);

      // Notify callback
      onNode?.(null);
    };
  }, [id, node, onNode]);

  // Handle layout changes
  const handleLayout = useCallback(() => {
    // Layout updates are handled automatically by the registry
    // via nativeID lookup on the native side
  }, []);

  // Merge styles
  const containerStyle = useMemo<StyleProp<ViewStyle>>(
    () => [styles.container, style],
    [style]
  );

  return (
    <View
      ref={viewRef}
      style={containerStyle}
      nativeID={nativeId}
      collapsable={false}
      onLayout={handleLayout}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Ensure the view doesn't collapse
  },
});

// =============================================================================
// Utility function - matches react-native-shared-element API
// =============================================================================

/**
 * Get a node reference from a ref
 * Utility for manual node handling
 *
 * @param ref - Ref to a View component with nativeID
 * @returns SharedElementNode or null
 */
export function nodeFromRef(ref: View | null): SharedElementNode | null {
  if (!ref) return null;

  // Access nativeID from the view's props
  // This works because we set collapsable={false}
  const props = (ref as any).props;
  const nativeId = props?.nativeID;

  if (!nativeId || typeof nativeId !== 'string') {
    return null;
  }

  // Extract transition ID from nativeId pattern: "shared-element-{id}-{counter}"
  const match = nativeId.match(/^shared-element-(.+)-\d+$/);
  if (!match || !match[1]) {
    return null;
  }

  return {
    nativeId,
    transitionId: match[1],
  };
}

export default SharedElement;
