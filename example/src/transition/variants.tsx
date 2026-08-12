/**
 * Transition variants.
 *
 * The whole point of the demo: the same gallery, driven by three different
 * `SharedTransitionConfigInput` values. The active one is handed straight to
 * `<SharedTransitionHost config={...}>` at the root, which is the library's
 * app-wide default — individual `<SharedElement config>` props would override
 * it per element.
 */

import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { SharedTransitionConfigInput } from 'react-native-shared-transition';

export type VariantId = 'spring' | 'timing' | 'bouncy';

export interface Variant {
  id: VariantId;
  /** Label for the segmented control. */
  label: string;
  /** One-line explanation shown under the control. */
  hint: string;
  config: SharedTransitionConfigInput;
}

export const VARIANTS: Variant[] = [
  {
    id: 'spring',
    label: 'Spring',
    hint: 'Library default — damping 24, stiffness 220.',
    config: {
      animation: 'spring',
      spring: { damping: 24, stiffness: 220, mass: 1 },
    },
  },
  {
    id: 'timing',
    label: 'Timing',
    hint: 'Fixed 420 ms curve, ease-in-out. Predictable and calm.',
    config: {
      animation: 'timing',
      duration: 420,
      easing: 'ease-in-out',
    },
  },
  {
    id: 'bouncy',
    label: 'Bouncy',
    hint: 'Under-damped spring — damping 11, stiffness 170. Overshoots.',
    config: {
      animation: 'spring',
      spring: { damping: 11, stiffness: 170, mass: 1 },
    },
  },
];

interface VariantContextValue {
  variant: Variant;
  setVariantId: (id: VariantId) => void;
}

const VariantContext = createContext<VariantContextValue | null>(null);

export function TransitionVariantProvider({
  children,
}: {
  children: (config: SharedTransitionConfigInput) => ReactNode;
}) {
  const [variantId, setVariantId] = useState<VariantId>('spring');

  const variant = useMemo(
    () => VARIANTS.find((v) => v.id === variantId) ?? VARIANTS[0]!,
    [variantId]
  );

  const value = useMemo<VariantContextValue>(
    () => ({ variant, setVariantId }),
    [variant]
  );

  return (
    <VariantContext.Provider value={value}>
      {children(variant.config)}
    </VariantContext.Provider>
  );
}

export function useTransitionVariant(): VariantContextValue {
  const value = useContext(VariantContext);
  if (!value) {
    throw new Error(
      'useTransitionVariant must be used inside <TransitionVariantProvider>'
    );
  }
  return value;
}
