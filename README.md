<p align="center">
  <img src="docs/assets/banner.png" alt="react-native-shared-transition" width="100%" />
</p>

<h1 align="center">react-native-shared-transition</h1>

<p align="center">
  <b>🚀 Modern shared element transitions for React Native</b><br/>
  Built with <b>New Architecture (Fabric)</b> and <b>Nitro Modules</b> for blazing-fast performance.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/react-native-shared-transition">
    <img src="https://img.shields.io/npm/v/react-native-shared-transition?style=flat-square&color=7c3aed" alt="npm version" />
  </a>
  <a href="https://github.com/giaBaoJS/react-native-shared-transition/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="license" />
  </a>
  <img src="https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg?style=flat-square" alt="platform" />
  <img src="https://img.shields.io/badge/architecture-New%20Architecture-green.svg?style=flat-square" alt="new architecture" />
  <a href="https://nitro.margelo.com/">
    <img src="https://img.shields.io/badge/powered%20by-Nitro%20Modules-ff69b4.svg?style=flat-square" alt="nitro modules" />
  </a>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-api-reference">API</a> •
  <a href="#-examples">Examples</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🏎️ **Blazing Fast** | Built with Nitro Modules - 3x faster than TurboModules |
| 🎯 **Fabric Native** | First-class support for React Native New Architecture |
| 🎬 **Smooth 60fps** | Animations powered by Reanimated on UI thread |
| 📸 **Native Snapshots** | High-quality view capture using native APIs |
| 🔌 **Framework Agnostic** | Works with React Navigation, Expo Router, or custom solutions |
| 📦 **Primitives First** | Provides building blocks - you control the transitions |
| 🎨 **Customizable** | Multiple animation types: move, fade, fade-in, fade-out |
| 💪 **Type Safe** | Full TypeScript support with comprehensive types |

## 📱 Demo

<p align="center">
  <img src="docs/assets/demo.gif" alt="Demo" width="300" />
</p>

## 🔧 Requirements

- React Native **0.76+** (New Architecture)
- iOS **13.0+**
- Android **API 24+** (Android 7.0)
- [react-native-nitro-modules](https://nitro.margelo.com/) **0.32+**
- [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/) **3.6+**

## 📦 Installation

```bash
# Using npm
npm install react-native-shared-transition react-native-nitro-modules react-native-reanimated

# Using yarn
yarn add react-native-shared-transition react-native-nitro-modules react-native-reanimated

# Using bun
bun add react-native-shared-transition react-native-nitro-modules react-native-reanimated
```

### iOS

```bash
cd ios && pod install
```

### Android

No additional steps required! 🎉

## 🚀 Quick Start

### 1. Mark Elements with `SharedElement`

```tsx
import { SharedElement } from 'react-native-shared-transition';

// Screen A - List Item
function ListScreen() {
  return (
    <TouchableOpacity onPress={() => navigate('Detail', { id: 'hero-1' })}>
      <SharedElement id="hero.photo">
        <Image source={hero.photo} style={styles.thumbnail} />
      </SharedElement>
      <Text>{hero.name}</Text>
    </TouchableOpacity>
  );
}

// Screen B - Detail View
function DetailScreen() {
  return (
    <View>
      <SharedElement id="hero.photo">
        <Image source={hero.photo} style={styles.fullImage} />
      </SharedElement>
      <Text>{hero.description}</Text>
    </View>
  );
}
```

### 2. Use Native APIs for Transitions

```tsx
import { 
  measureNode, 
  captureSnapshot,
  setNodeHidden 
} from 'react-native-shared-transition';

// Measure element position and size
const nodeData = await measureNode(nativeId);
console.log(nodeData.layout); // { x, y, width, height }

// Capture snapshot as image URI
const snapshotUri = await captureSnapshot(nativeId);

// Hide/show original element during transition
setNodeHidden(nativeId, true);
```

### 3. Animate with Reanimated

```tsx
import { SharedElementTransition, useSharedTransitionValue } from 'react-native-shared-transition';
import { useSharedValue, withTiming } from 'react-native-reanimated';

function TransitionOverlay({ startNode, endNode }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    // Animate from 0 to 1
    progress.value = withTiming(1, { duration: 350 });
  }, []);

  return (
    <SharedElementTransition
      start={{ node: startNode }}
      end={{ node: endNode }}
      position={progress}
      animation="move" // or "fade", "fade-in", "fade-out"
      resize="auto"
    />
  );
}
```

## 📖 API Reference

### Components

#### `<SharedElement>`

Wraps a child component and registers it for shared element transitions.

```tsx
<SharedElement
  id="unique-id"           // Required: Unique identifier
  style={containerStyle}   // Optional: Container style
  onNode={(node) => {}}    // Optional: Callback when node is ready
>
  <YourComponent />
</SharedElement>
```

#### `<SharedElementTransition>`

Renders the animated transition overlay.

```tsx
<SharedElementTransition
  start={{ node: startNode }}  // Required: Source element
  end={{ node: endNode }}      // Required: Destination element
  position={sharedValue}       // Required: Reanimated SharedValue (0-1)
  animation="move"             // Optional: Animation type
  resize="auto"                // Optional: Resize behavior
  debug={false}                // Optional: Show debug overlay
  onMeasure={(data) => {}}     // Optional: Measurement callback
/>
```

### Hooks

#### `useSharedTransitionValue(elementId, config?)`

Hook for controlling transitions with Reanimated SharedValue.

```tsx
const { progress, state, start, reset } = useSharedTransitionValue('hero.photo', {
  duration: 300,
  easing: 'easeInOut',
});

// progress: SharedValue<number> (0-1)
// state: 'idle' | 'preparing' | 'running' | 'completed' | 'error'
// start: () => Promise<void>
// reset: () => void
```

### Native Functions

| Function | Description |
|----------|-------------|
| `measureNode(nativeId)` | Get layout position and capture snapshot |
| `captureSnapshot(nativeId)` | Capture view as image URI |
| `setNodeHidden(nativeId, hidden)` | Hide/show element during transition |
| `prepareTransition(startId, endId, config)` | Prepare both elements at once |
| `cleanup()` | Clean cached snapshots and resources |

### Registry

```tsx
import { SharedElementRegistry } from 'react-native-shared-transition';

// Get transition pair
const pair = SharedElementRegistry.getTransitionPair('hero.photo');
// { start: SharedElementNode, end: SharedElementNode }

// Subscribe to changes
const unsubscribe = SharedElementRegistry.subscribe((id, nodes) => {
  if (nodes.length >= 2) {
    // Transition is possible!
  }
});

// Get all ready transitions
const readyIds = SharedElementRegistry.getReadyTransitions();
```

## 🎨 Animation Types

| Type | Description |
|------|-------------|
| `move` | Simple position/size interpolation (default) |
| `fade` | Cross-fade between start and end snapshots |
| `fade-in` | Fade in the destination element |
| `fade-out` | Fade out the source element |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     JavaScript Layer                         │
├─────────────────────────────────────────────────────────────┤
│  SharedElement    │  SharedElementTransition  │  Hooks      │
│  (registers view) │  (animated overlay)       │  (control)  │
├─────────────────────────────────────────────────────────────┤
│                    SharedElementRegistry                     │
│              (tracks elements across screens)                │
├─────────────────────────────────────────────────────────────┤
│                      Native Bridge                           │
│              (Nitro Modules - C++ bindings)                  │
├─────────────────────────────────────────────────────────────┤
│         iOS (Swift)          │      Android (Kotlin)         │
│  UIGraphicsImageRenderer     │      View.draw()              │
│  accessibilityLabel lookup   │      contentDescription       │
│  CALayer snapshot            │      Bitmap capture           │
└─────────────────────────────────────────────────────────────┘
```

## 📂 Project Structure

```
react-native-shared-transition/
├── src/
│   ├── index.tsx                 # Public exports
│   ├── SharedElement.tsx         # Mark elements for transition
│   ├── SharedElementTransition.tsx # Animated overlay component
│   ├── SharedElementRegistry.ts  # Element tracking
│   ├── useSharedTransition.ts    # React hooks
│   ├── types.ts                  # TypeScript definitions
│   ├── native/                   # Native module bridge
│   └── specs/                    # Nitro & Turbo specs
├── ios/                          # iOS native code (Swift)
├── android/                      # Android native code (Kotlin)
├── example-react-navigation/     # Example app
└── docs/                         # Documentation
```

## 🤝 Contributing

We love contributions! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a Pull Request.

```bash
# Clone the repository
git clone https://github.com/giaBaoJS/react-native-shared-transition.git
cd react-native-shared-transition

# Install dependencies
yarn install

# Run example app
cd example-react-navigation
yarn ios   # or yarn android
```

### Development

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## ⭐ Star History

If you find this library useful, please consider giving it a star! ⭐

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/giaBaoJS">Bao Nguyen</a>
</p>

<p align="center">
  <a href="https://github.com/giaBaoJS/react-native-shared-transition/issues">Report Bug</a>
  •
  <a href="https://github.com/giaBaoJS/react-native-shared-transition/issues">Request Feature</a>
</p>
