/**
 * TransitionView
 *
 * The animated overlay for a single in-flight shared element transition.
 * Owns the Reanimated shared values so that retargets (interrupted
 * transitions) continue smoothly from the current animated position.
 */

import { cloneElement, isValidElement, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import type { ReactElement } from 'react';
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type {
  EasingFunction,
  WithSpringConfig,
  WithTimingConfig,
} from 'react-native-reanimated';

import { TransitionCoordinator } from './TransitionCoordinator';
import type { TransitionEntry } from './TransitionCoordinator';
import type { SharedTransitionEasing } from './types';

const EASINGS: Record<SharedTransitionEasing, EasingFunction> = {
  'linear': Easing.linear,
  'ease': Easing.ease,
  'ease-in': Easing.in(Easing.ease),
  'ease-out': Easing.out(Easing.ease),
  'ease-in-out': Easing.inOut(Easing.ease),
};

function cloneContent(
  element: ReactElement | null,
  contentScale: 'resize' | 'transform'
): ReactElement | null {
  if (!isValidElement(element)) return null;
  const props = element.props as { style?: unknown };
  return cloneElement(element as ReactElement<{ style?: unknown }>, {
    style: [
      props.style as never,
      // Fill the animated container; the container draws border + radius.
      contentScale === 'resize' ? styles.fillResize : StyleSheet.absoluteFill,
      styles.contentReset,
    ],
  });
}

export function TransitionView({ entry }: { entry: TransitionEntry }) {
  const { from, fromRadius, config } = entry;
  const contentScale = config.contentScale;
  const hasFadeContent = entry.fadeContent != null;

  const x = useSharedValue(from.x);
  const y = useSharedValue(from.y);
  const width = useSharedValue(from.width);
  const height = useSharedValue(from.height);
  const radius = useSharedValue(config.morphBorderRadius ? fromRadius : 0);
  const fade = useSharedValue(0);
  /**
   * Drives completion. It always travels 0 → 1, which matters: Reanimated's
   * spring settles on the very first frame when its start and end values are
   * equal (zero initial energy). Hanging the completion callback off a
   * geometric value would therefore end the transition immediately whenever
   * that dimension happens not to change — e.g. a full-bleed image morphing
   * into another full-bleed image, where only `y` and `height` move.
   */
  const progress = useSharedValue(0);

  // Destination layout for 'transform' content scaling — static per target.
  const toWidth = entry.to.width;
  const toHeight = entry.to.height;

  useEffect(() => {
    const { to, toRadius, config: cfg, id, generation } = entry;

    const spring: WithSpringConfig = cfg.spring;
    const timing: WithTimingConfig = {
      duration: cfg.duration,
      easing: EASINGS[cfg.easing] ?? EASINGS['ease-in-out'],
    };
    const animate = (value: number) =>
      cfg.animation === 'spring'
        ? withSpring(value, spring)
        : withTiming(value, timing);

    const notifyComplete = () => {
      TransitionCoordinator.handleComplete(id, generation);
    };
    const onSettled = (finished: boolean | undefined) => {
      'worklet';
      if (finished) {
        runOnJS(notifyComplete)();
      }
    };

    x.value = animate(to.x);
    y.value = animate(to.y);
    width.value = animate(to.width);
    height.value = animate(to.height);
    radius.value = animate(cfg.morphBorderRadius ? toRadius : 0);
    fade.value = animate(1);

    // Restart progress from 0 so a retarget re-runs the full settle window.
    progress.value = 0;
    progress.value =
      cfg.animation === 'spring'
        ? withSpring(1, spring, onSettled)
        : withTiming(1, timing, onSettled);

    // Hide the originals only now that the overlay exists — no empty frame.
    TransitionCoordinator.handleOverlayReady(id, generation);

    return () => {
      cancelAnimation(x);
      cancelAnimation(y);
      cancelAnimation(width);
      cancelAnimation(height);
      cancelAnimation(radius);
      cancelAnimation(fade);
      cancelAnimation(progress);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.generation]);

  const containerStyle = useAnimatedStyle(() => {
    if (contentScale === 'transform') {
      // Lay out at destination size, scale/translate to the animated frame.
      const scaleX = toWidth > 0 ? width.value / toWidth : 1;
      const scaleY = toHeight > 0 ? height.value / toHeight : 1;
      return {
        width: toWidth,
        height: toHeight,
        borderRadius: radius.value,
        transform: [
          { translateX: x.value + (width.value - toWidth) / 2 },
          { translateY: y.value + (height.value - toHeight) / 2 },
          { scaleX },
          { scaleY },
        ],
      };
    }
    return {
      width: width.value,
      height: height.value,
      borderRadius: radius.value,
      transform: [{ translateX: x.value }, { translateY: y.value }],
    };
  });

  // Cross-fade completes at ~55% of the flight so no ghost lingers through
  // the spring's settling tail.
  const contentInStyle = useAnimatedStyle(() => ({
    opacity: hasFadeContent ? Math.min(1, fade.value * 1.8) : 1,
  }));
  const contentOutStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0, 1 - fade.value * 1.8),
  }));

  const content = cloneContent(entry.content, config.contentScale);
  const fadeContent = entry.fadeContent
    ? cloneContent(entry.fadeContent, config.contentScale)
    : null;

  const borderStyle = {
    borderWidth: entry.borderWidth,
    borderColor: entry.borderColor,
  };

  return (
    <Animated.View
      style={[styles.container, borderStyle, containerStyle]}
      pointerEvents="none"
    >
      {fadeContent ? (
        <Animated.View style={[StyleSheet.absoluteFill, contentOutStyle]}>
          {fadeContent}
        </Animated.View>
      ) : null}
      <Animated.View style={[StyleSheet.absoluteFill, contentInStyle]}>
        {content}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
    overflow: 'hidden',
  },
  fillResize: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
  },
  contentReset: {
    // The overlay container draws border + radius; the clone must not.
    borderWidth: 0,
    borderRadius: 0,
    margin: 0,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
  },
});

export default TransitionView;
