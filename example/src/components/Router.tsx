/**
 * Router with Shared Element Transitions
 *
 * A complete navigation router that orchestrates shared element
 * transitions using our library's SharedElementTransition component.
 */

import { Component } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  BackHandler,
  Easing,
} from 'react-native';
import {
  SharedElementTransition,
  SharedElementRegistry,
} from 'react-native-shared-transition';
import type {
  SharedElementsConfig,
  SharedElementStrictConfig,
} from 'react-native-shared-transition';
import { Colors } from './Colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// =============================================================================
// Types
// =============================================================================

export interface RouterConfig {
  sharedElements?: SharedElementsConfig;
  duration?: number;
}

interface StackItem {
  node: React.ReactNode;
  config?: RouterConfig;
}

interface RouterState {
  stack: StackItem[];
  prevIndex: number;
  nextIndex: number;
  isAnimating: boolean;
  width: number;
  height: number;
}

interface RouterProps {
  initialNode: React.ReactNode;
}

// =============================================================================
// Global Router Instance
// =============================================================================

let routerInstance: Router | null = null;

export const RouterStatic = {
  push: (node: React.ReactNode, config?: RouterConfig) => {
    routerInstance?.push(node, config);
  },
  pop: (config?: RouterConfig) => {
    routerInstance?.pop(config);
  },
};

// =============================================================================
// Router Component
// =============================================================================

export class Router extends Component<RouterProps, RouterState> {
  private animValue = new Animated.Value(0);
  private backHandler: any;

  constructor(props: RouterProps) {
    super(props);
    routerInstance = this;
    this.state = {
      stack: [{ node: props.initialNode }],
      prevIndex: 0,
      nextIndex: 0,
      isAnimating: false,
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
    };
  }

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.onBackPress
    );
  }

  componentWillUnmount() {
    this.backHandler?.remove();
    routerInstance = null;
  }

  onBackPress = () => {
    if (this.state.stack.length > 1) {
      this.pop();
      return true;
    }
    return false;
  };

  onLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    if (this.state.width !== width || this.state.height !== height) {
      this.setState({ width, height });
    }
  };

  push = (node: React.ReactNode, config?: RouterConfig) => {
    if (this.state.isAnimating) return;

    const { stack, nextIndex } = this.state;
    const duration = config?.duration ?? 400;

    this.setState({
      stack: [...stack, { node, config }],
      nextIndex: nextIndex + 1,
      isAnimating: true,
    });

    Animated.timing(this.animValue, {
      toValue: stack.length,
      duration,
      easing: Easing.bezier(0.2833, 0.99, 0.31833, 0.99),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        this.setState({
          prevIndex: stack.length,
          isAnimating: false,
        });
      }
    });
  };

  pop = (config?: RouterConfig) => {
    const { stack, nextIndex, isAnimating } = this.state;
    if (isAnimating || stack.length <= 1) return;

    const duration = config?.duration ?? 400;

    this.setState({
      nextIndex: nextIndex - 1,
      isAnimating: true,
    });

    Animated.timing(this.animValue, {
      toValue: stack.length - 2,
      duration,
      easing: Easing.bezier(0.2833, 0.99, 0.31833, 0.99),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        this.setState((state) => ({
          stack: state.stack.slice(0, -1),
          prevIndex: state.nextIndex,
          isAnimating: false,
        }));
      }
    });
  };

  // Static methods for global access
  static push = RouterStatic.push;
  static pop = RouterStatic.pop;

  renderScreens() {
    const { stack, nextIndex, prevIndex, width } = this.state;

    return stack.map((item, index) => {
      const isActive = index === nextIndex || index === prevIndex;
      if (!isActive && index < Math.min(nextIndex, prevIndex)) return null;

      // Screen slide animation
      const translateX = this.animValue.interpolate({
        inputRange: [index - 1, index, index + 1],
        outputRange: [width, 0, -width * 0.3],
        extrapolate: 'clamp',
      });

      // Fade and scale for background screen
      const opacity = this.animValue.interpolate({
        inputRange: [index - 1, index, index + 1],
        outputRange: [1, 1, 0.6],
        extrapolate: 'clamp',
      });

      const scale = this.animValue.interpolate({
        inputRange: [index - 1, index, index + 1],
        outputRange: [1, 1, 0.95],
        extrapolate: 'clamp',
      });

      return (
        <Animated.View
          key={`screen-${index}`}
          style={[
            styles.screen,
            {
              transform: [{ translateX }, { scale }],
              opacity,
            },
          ]}
          pointerEvents={index === nextIndex ? 'auto' : 'none'}
        >
          {item.node}
        </Animated.View>
      );
    });
  }

  renderSharedElementTransitions() {
    const { stack, prevIndex, nextIndex } = this.state;

    // Only render during transition
    if (prevIndex === nextIndex || stack.length <= 1) {
      return null;
    }

    const startIndex = Math.min(prevIndex, nextIndex);
    const endIndex = Math.max(prevIndex, nextIndex);

    // Get shared elements config from the target screen
    const targetItem = stack[endIndex];
    const sharedElements = targetItem?.config?.sharedElements;

    if (!sharedElements || sharedElements.length === 0) {
      return null;
    }

    // Calculate position for transition (0 = start, 1 = end)
    const position = this.animValue.interpolate({
      inputRange: [startIndex, endIndex],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.transitionOverlay} pointerEvents="none">
        {sharedElements.map((config, idx) => {
          // Normalize config
          const normalized: SharedElementStrictConfig =
            typeof config === 'string'
              ? { id: config, otherId: config, animation: 'move', resize: 'auto', align: 'auto', debug: false }
              : {
                  id: config.id,
                  otherId: config.otherId || config.id,
                  animation: config.animation || 'move',
                  resize: config.resize || 'auto',
                  align: config.align || 'auto',
                  debug: config.debug || false,
                };

          // Get transition pair from registry
          const pair = SharedElementRegistry.getTransitionPair(normalized.id);
          if (!pair) {
            return null;
          }

          return (
            <SharedElementTransition
              key={`transition-${normalized.id}-${idx}`}
              start={{ node: pair.start }}
              end={{ node: pair.end }}
              position={position}
              animation={normalized.animation}
              resize={normalized.resize}
              align={normalized.align}
            />
          );
        })}
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container} onLayout={this.onLayout}>
        {this.renderScreens()}
        {this.renderSharedElementTransitions()}
      </View>
    );
  }
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.empty,
  },
  screen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.empty,
  },
  transitionOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
});

export default Router;
