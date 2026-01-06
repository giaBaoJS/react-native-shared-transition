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

import { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import type { ViewStyle, StyleProp } from 'react-native';

import type {
  SharedElementId,
  SharedElementNode,
  SharedElementProps,
} from './types';
import { SharedElementRegistry } from './SharedElementRegistry';

// Counter for generating unique native IDs
let nativeIdCounter = 0;

function generateNativeId(transitionId: SharedElementId): string {
  nativeIdCounter += 1;
  return `shared-element-${transitionId}-${nativeIdCounter}`;
}

/**
 * SharedElement Component
 * Wraps children and registers for shared element transitions.
 */
export function SharedElement({
  id,
  style,
  children,
  onNode,
}: SharedElementProps) {
  const nativeId = useMemo(() => generateNativeId(id), [id]);

  const node = useMemo<SharedElementNode>(
    () => ({ nativeId, transitionId: id }),
    [nativeId, id]
  );

  // Register/unregister with global registry
  useEffect(() => {
    SharedElementRegistry.registerElement(id, node);
    onNode?.(node);

    return () => {
      SharedElementRegistry.unregisterElement(id, node);
      onNode?.(null);
    };
  }, [id, node, onNode]);

  const containerStyle = useMemo<StyleProp<ViewStyle>>(
    () => [styles.container, style],
    [style]
  );

  return (
    <View
      style={containerStyle}
      nativeID={nativeId}
      accessibilityLabel={nativeId} // For Android view finding in Fabric
      collapsable={false}
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
