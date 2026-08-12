/**
 * useSharedTransition
 *
 * Observe the state of shared element transitions — e.g. to defer work or
 * disable touches while an overlay is in flight.
 *
 * ```tsx
 * const { isTransitioning } = useSharedTransition();          // any transition
 * const { isTransitioning } = useSharedTransition('hero.1');  // specific id
 * ```
 */

import { useCallback, useEffect, useState } from 'react';

import { TransitionCoordinator } from './TransitionCoordinator';
import type { SharedElementId, SharedTransitionSnapshot } from './types';

export function useSharedTransition(
  id?: SharedElementId
): SharedTransitionSnapshot {
  const read = useCallback(
    (): SharedTransitionSnapshot => ({
      isTransitioning: TransitionCoordinator.isActive(id),
      activeIds: TransitionCoordinator.getActiveIds(),
    }),
    [id]
  );

  const [snapshot, setSnapshot] = useState<SharedTransitionSnapshot>(read);

  useEffect(() => {
    setSnapshot(read());
    return TransitionCoordinator.subscribeState((changedId) => {
      if (id === undefined || changedId === id) {
        setSnapshot(read());
      }
    });
  }, [id, read]);

  return snapshot;
}

export default useSharedTransition;
