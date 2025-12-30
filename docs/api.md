# API Reference

## Components

### `<SharedElement>`

Marks a view as a shared element for automatic transitions.

```typescript
<SharedElement id="unique-id">
  <Image source={...} />
</SharedElement>
```

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `id` | `string` | ✅ Yes | - | Unique identifier. Elements with matching IDs will transition automatically. |
| `children` | `ReactNode` | ✅ Yes | - | Content to render |
| `style` | `ViewStyle` | ❌ No | - | Style applied to the wrapper view |
| `disabled` | `boolean` | ❌ No | `false` | Disable transitions for this element |

#### Behavior

- **Automatic Detection**: When multiple `SharedElement` components with the same `id` are mounted, the library automatically detects and coordinates the transition
- **Layout Tracking**: Continuously measures and updates element position/size
- **Registry-Based**: Uses a global registry to coordinate between elements across screens

#### Example

```typescript
// Screen A (List)
<SharedElement id="photo-123">
  <Image source={photo} style={styles.thumbnail} />
</SharedElement>

// Screen B (Detail) - Same ID = Automatic transition!
<SharedElement id="photo-123">
  <Image source={photo} style={styles.fullscreen} />
</SharedElement>
```

---

## Hooks

### `useSharedTransition(id, config?)`

Monitor and control shared element transitions with Reanimated shared values.

```typescript
const transition = useSharedTransition('photo-123', { duration: 400 });
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Shared element identifier to monitor |
| `config` | `SharedTransitionConfig` | ❌ No | Transition configuration |

#### Config Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `duration` | `number` | `300` | Animation duration in milliseconds |
| `disabled` | `boolean` | `false` | Disable automatic transition detection |

#### Return Value

```typescript
interface SharedTransitionResult {
  // Current layout (sync, immediately available)
  layout: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;

  // Transition state
  state: 'idle' | 'transitioning' | 'completed';

  // Reanimated shared values for custom animations
  animated: {
    progress: SharedValue<number>; // 0 to 1
    x: SharedValue<number>;
    y: SharedValue<number>;
    width: SharedValue<number>;
    height: SharedValue<number>;
  };

  // Manual control (advanced)
  start: () => void;
  reset: () => void;
}
```

#### Usage Example

```typescript
import { useSharedTransition } from 'react-native-shared-transition';
import { useAnimatedStyle } from 'react-native-reanimated';

function DetailScreen() {
  const transition = useSharedTransition('hero-image', {
    duration: 400,
  });

  // Use shared values in animations
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: transition.animated.progress.value,
    transform: [
      { scale: 1 + transition.animated.progress.value * 0.1 }
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <SharedElement id="hero-image">
        <Image source={...} />
      </SharedElement>
    </Animated.View>
  );
}
```

#### Advanced: Custom Animations

The `animated` shared values are fully compatible with Reanimated worklets:

```typescript
const transition = useSharedTransition('element-id');

const customStyle = useAnimatedStyle(() => {
  const progress = transition.animated.progress.value;

  return {
    opacity: interpolate(progress, [0, 0.5, 1], [0, 1, 1]),
    transform: [
      { translateY: (1 - progress) * 100 },
      { scale: 0.8 + progress * 0.2 },
      { rotate: `${(1 - progress) * 45}deg` }
    ],
  };
});
```

---

## Types

### `SharedElementId`

```typescript
type SharedElementId = string;
```

Unique identifier for shared elements.

### `ElementLayout`

```typescript
interface ElementLayout {
  x: number;      // X position (screen coordinates)
  y: number;      // Y position (screen coordinates)
  width: number;  // Width in pixels
  height: number; // Height in pixels
}
```

Layout information for an element.

### `TransitionState`

```typescript
type TransitionState = 'idle' | 'transitioning' | 'completed';
```

Current state of the transition:
- `idle`: No transition active
- `transitioning`: Transition in progress
- `completed`: Transition finished

---

## Navigation Integration

The library is **navigation-agnostic**. Here's how to use it with popular routers:

### React Navigation

```typescript
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SharedElement } from 'react-native-shared-transition';

const Stack = createNativeStackNavigator();

// List screen
function ListScreen({ navigation }) {
  return (
    <TouchableOpacity onPress={() => navigation.navigate('Detail')}>
      <SharedElement id="item-1">
        <Image source={...} />
      </SharedElement>
    </TouchableOpacity>
  );
}

// Detail screen
function DetailScreen() {
  return (
    <SharedElement id="item-1">
      <Image source={...} />
    </SharedElement>
  );
}
```

The transition happens automatically during navigation!

### Expo Router

```typescript
// app/index.tsx
import { Link } from 'expo-router';
import { SharedElement } from 'react-native-shared-transition';

export default function Home() {
  return (
    <Link href="/details">
      <SharedElement id="hero">
        <Image source={...} />
      </SharedElement>
    </Link>
  );
}

// app/details.tsx
export default function Details() {
  return (
    <SharedElement id="hero">
      <Image source={...} />
    </SharedElement>
  );
}
```

### Custom Navigation

No navigation library? No problem:

```typescript
const [currentScreen, setCurrentScreen] = useState('list');

return (
  <>
    {currentScreen === 'list' && (
      <TouchableOpacity onPress={() => setCurrentScreen('detail')}>
        <SharedElement id="item">
          <View style={styles.small} />
        </SharedElement>
      </TouchableOpacity>
    )}

    {currentScreen === 'detail' && (
      <SharedElement id="item">
        <View style={styles.large} />
      </SharedElement>
    )}
  </>
);
```

---

## Best Practices

### 1. Use Unique IDs

```typescript
// ✅ Good: Unique per item
<SharedElement id={`photo-${item.id}`}>

// ❌ Bad: Same ID for all items
<SharedElement id="photo">
```

### 2. Keep Consistent Content

The same content should render in both source and target:

```typescript
// ✅ Good: Same image
<SharedElement id="hero">
  <Image source={{ uri: photo.url }} />
</SharedElement>

// ❌ Bad: Different content
<SharedElement id="hero">
  <View style={{ backgroundColor: 'red' }} />
</SharedElement>
```

### 3. Handle Loading States

```typescript
const transition = useSharedTransition('hero');

if (!transition.layout) {
  return <ActivityIndicator />; // Wait for measurement
}
```

### 4. Disable When Not Needed

```typescript
<SharedElement id="item" disabled={!shouldTransition}>
  <Image source={...} />
</SharedElement>
```

### 5. Use Meaningful Durations

```typescript
// ✅ Good: Balanced timing
const transition = useSharedTransition('hero', { duration: 300 });

// ❌ Too slow
const transition = useSharedTransition('hero', { duration: 2000 });
```

---

## Troubleshooting

### Transition Not Working

**Check:**
1. Both elements have the **same** `id`
2. Both elements are actually mounted (use React DevTools)
3. `disabled={true}` is not set
4. Layout has been measured (`transition.layout !== null`)

**Debug:**
```typescript
const transition = useSharedTransition('my-id');
console.log('State:', transition.state);
console.log('Layout:', transition.layout);
console.log('Progress:', transition.animated.progress.value);
```

### Performance Issues

- Ensure Reanimated babel plugin is installed
- Use `useAnimatedStyle` instead of inline styles
- Check that animations run on UI thread (use `'worklet'` directive)

### Layout Measurements Wrong

- Ensure elements have rendered before transition starts
- Check that parent views don't have `display: 'none'`
- Use `onLayout` to verify measurements

---

## Examples

See the [example app](../example/src/App.tsx) for a complete working demo showing:
- Automatic transition detection
- Custom animations with Reanimated
- Layout measurements
- State management
- Debug information

Run the example:

```bash
cd example
yarn install
yarn ios # or yarn android
```

---

**Next:** See [support.md](./support.md) for platform requirements.

