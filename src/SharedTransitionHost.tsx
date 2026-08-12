/**
 * SharedTransitionHost
 *
 * Mount once at the root of the app (wrapping your navigation container).
 * Renders the in-flight transition overlays in a full-screen layer and wires
 * the TransitionCoordinator to the SharedElementRegistry.
 *
 * ```tsx
 * <SharedTransitionHost>
 *   <NavigationContainer>...</NavigationContainer>
 * </SharedTransitionHost>
 * ```
 *
 * The host must fill the window (it uses window coordinates for overlays).
 */

import { useEffect, useSyncExternalStore } from 'react';
import { StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';

import { TransitionCoordinator } from './TransitionCoordinator';
import { TransitionView } from './TransitionView';
import type { SharedTransitionConfigInput } from './types';

export interface SharedTransitionHostProps {
  /** Default transition config, overridable per `<SharedElement config>`. */
  config?: SharedTransitionConfigInput;
  children?: ReactNode;
}

export function SharedTransitionHost({
  config,
  children,
}: SharedTransitionHostProps) {
  useEffect(() => {
    TransitionCoordinator.attach(config);
    return () => {
      TransitionCoordinator.detach();
    };
    // Attach once; config updates are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    TransitionCoordinator.setDefaultConfig(config);
  }, [config]);

  const entries = useSyncExternalStore(
    TransitionCoordinator.subscribe,
    TransitionCoordinator.getEntries,
    TransitionCoordinator.getEntries
  );

  return (
    <View style={styles.host} pointerEvents="box-none">
      {children}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {entries.map((entry) => (
          <TransitionView key={entry.key} entry={entry} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
  },
});

export default SharedTransitionHost;
