# API Reference

## Components

### `<SharedTransitionHost>`

Mount **once** at the root of your app, wrapping your navigation container.
It renders the transition overlays and coordinates every transition.

```tsx
import { SharedTransitionHost } from 'react-native-shared-transition';

export default function App() {
  return (
    <SharedTransitionHost>
      <NavigationContainer>{/* ... */}</NavigationContainer>
    </SharedTransitionHost>
  );
}
```

| Prop       | Type                           | Description                                                       |
| ---------- | ------------------------------ | ----------------------------------------------------------------- |
| `config`   | `SharedTransitionConfigInput?` | Default transition config, overridable per `<SharedElement>`.     |
| `children` | `ReactNode`                    | Your app content. The host must fill the window (it is `flex:1`). |

### `<SharedElement>`

Wraps a single child and registers it for transitions. When another
`SharedElement` with the same `id` mounts on a different screen, the host
automatically morphs between the two. When that screen unmounts again, the
reverse transition runs automatically.

```tsx
<SharedElement id={`hero.${hero.id}.photo`}>
  <Image source={hero.photo} style={styles.photo} />
</SharedElement>
```

| Prop       | Type                           | Description                                             |
| ---------- | ------------------------------ | ------------------------------------------------------- |
| `id`       | `string`                       | Matches elements across screens.                        |
| `style`    | `StyleProp<ViewStyle>?`        | Style for the wrapper view.                             |
| `config`   | `SharedTransitionConfigInput?` | Per-element config, merged over the host default.       |
| `children` | `ReactNode`                    | Exactly one child element (`Image`, `Text`, `View`, …). |

## Configuration

`SharedTransitionConfigInput` — every field optional; unset fields fall back to
the host config, then to the defaults:

| Field               | Type                      | Default    | Description                                                                                                                                     |
| ------------------- | ------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `animation`         | `'spring' \| 'timing'`    | `'spring'` | Animation driver.                                                                                                                                |
| `spring`            | `SpringConfig`            | see below  | `damping`, `stiffness`, `mass`, `overshootClamping` (Reanimated `withSpring`).                                                                   |
| `duration`          | `number`                  | `320`      | Duration in ms (`timing` only).                                                                                                                  |
| `easing`            | `EasingName`              | `'ease-in-out'` | `'linear' \| 'ease' \| 'ease-in' \| 'ease-out' \| 'ease-in-out'` (`timing` only).                                                           |
| `crossFade`         | `boolean`                 | `false`    | Cross-fade source content into target content. Enable when the two sides render different content (e.g. text at different font sizes).           |
| `morphBorderRadius` | `boolean`                 | `true`     | Animate `borderRadius` between the source and target styles (numeric radii only).                                                                |
| `contentScale`      | `'resize' \| 'transform'` | `'resize'` | `'resize'` re-lays-out content at the animated size each frame (best for images). `'transform'` lays out once at the destination size and scales (best for text). |

Default spring: `{ damping: 26, stiffness: 290, mass: 1, overshootClamping: false }`.

```tsx
<SharedElement
  id="hero.name"
  config={{ contentScale: 'transform', crossFade: true }}
>
  <Text style={styles.name}>{hero.name}</Text>
</SharedElement>
```

## Hooks

### `useSharedTransition(id?)`

Observe transition state — e.g. to disable touches while an overlay is in
flight.

```tsx
const { isTransitioning, activeIds } = useSharedTransition(); // any transition
const { isTransitioning } = useSharedTransition('hero.1.photo'); // one id
```

Returns `{ isTransitioning: boolean, activeIds: string[] }`.

## Advanced — native primitives

These wrap the Nitro module directly. You don't need them for normal usage.

| Function                                            | Description                                                             |
| --------------------------------------------------- | ----------------------------------------------------------------------- |
| `isNativeModuleAvailable(): boolean`                | Whether the Nitro module loaded.                                        |
| `measureNode(nativeId): Promise<MeasuredFrame>`     | Measure a view (window coordinates, dp) by its `nativeID` prop.         |
| `captureSnapshot(nativeId): Promise<SnapshotResult>`| Capture a PNG snapshot (`file://` URI + logical size).                  |
| `setNodeHidden(nativeId, hidden): void`             | Hide/show a view by `nativeID` (alpha-based, layout-free).              |
| `cleanup(): void`                                   | Delete captured snapshots, restore hidden views.                        |

`SharedElementRegistry` (the element registry) is also exported for testing and
advanced integrations — see the source for its API.

## Navigation integration notes

- Use **`animation: 'fade'`** (or `'none'`, `'fade_from_bottom'`) on the
  native-stack screens that participate in shared transitions. Sliding
  animations move the target while the overlay measures it, which breaks the
  final frame.
- The reverse transition starts from the element's **last measured frame**. If
  the user scrolls the detail screen so the element moves before going back,
  the return animation starts from the stale frame (known limitation).
- Gesture-driven progressive transitions (dragging the screen and the shared
  element following the finger) are not supported yet; the return animation
  plays after the pop completes.
