/**
 * SharedElement
 *
 * Wraps a single child and registers it for shared element transitions.
 * When another SharedElement with the same `id` mounts on a different screen,
 * the `<SharedTransitionHost>` animates between the two automatically.
 *
 * ```tsx
 * <SharedElement id={`hero.${hero.id}.photo`}>
 *   <Image source={hero.photo} style={styles.photo} />
 * </SharedElement>
 * ```
 */

import { Children, isValidElement, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import type { ReactElement } from 'react';

import { SharedElementRegistry } from './SharedElementRegistry';
import type { SharedElementProps } from './types';

let nativeIdCounter = 0;

function generateNativeId(id: string): string {
  nativeIdCounter += 1;
  return `shared-element:${id}:${nativeIdCounter}`;
}

interface ExtractedStyle {
  borderRadius: number;
  borderWidth: number;
  borderColor: string | undefined;
}

function extractStyle(element: ReactElement | null): ExtractedStyle {
  const style = element
    ? StyleSheet.flatten(
        (element.props as { style?: unknown }).style as never
      ) ?? {}
    : {};
  const borderRadius = (style as { borderRadius?: unknown }).borderRadius;
  const borderWidth = (style as { borderWidth?: unknown }).borderWidth;
  const borderColor = (style as { borderColor?: unknown }).borderColor;
  return {
    borderRadius: typeof borderRadius === 'number' ? borderRadius : 0,
    borderWidth: typeof borderWidth === 'number' ? borderWidth : 0,
    borderColor: typeof borderColor === 'string' ? borderColor : undefined,
  };
}

export function SharedElement({
  id,
  style,
  children,
  config,
}: SharedElementProps) {
  // Must be stable for the component's whole lifetime. `useMemo` is explicitly
  // not a caching guarantee — if React discarded it, the identity would change
  // and the registration effect would unregister/re-register, which a mounted
  // partner would see as a spurious back-then-forward transition.
  // (The `id` baked into the string is only a debugging label.)
  const nativeIdRef = useRef<string | null>(null);
  if (nativeIdRef.current === null) {
    nativeIdRef.current = generateNativeId(id);
  }
  const nativeId = nativeIdRef.current;

  const onlyChild = Children.only(children);
  const element = isValidElement(onlyChild) ? onlyChild : null;

  // Layout can fire before the registration effect — remember it.
  const layoutReadyRef = useRef(false);

  // Keep the latest clone template/config available to the registration
  // effect without re-registering on every render.
  const latest = useRef({ element, config });
  latest.current = { element, config };

  useEffect(() => {
    const { element: currentElement, config: currentConfig } = latest.current;
    SharedElementRegistry.register({
      id,
      nativeId,
      element: currentElement,
      config: currentConfig,
      layoutReady: layoutReadyRef.current,
      ...extractStyle(currentElement),
    });
    return () => {
      SharedElementRegistry.unregister(nativeId);
    };
  }, [id, nativeId]);

  // Refresh mutable fields (clone template, config) on re-render.
  useEffect(() => {
    SharedElementRegistry.update(nativeId, {
      element,
      config,
      ...extractStyle(element),
    });
  });

  return (
    <View
      style={style}
      nativeID={nativeId}
      collapsable={false}
      onLayout={() => {
        layoutReadyRef.current = true;
        SharedElementRegistry.markLayoutReady(nativeId);
      }}
    >
      {children}
    </View>
  );
}

export default SharedElement;
