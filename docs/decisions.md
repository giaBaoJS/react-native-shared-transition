# Product Scope & Philosophy

## What This Library Does

`react-native-shared-transition` provides shared element transitions for React Native applications built on the New Architecture.

**Core capabilities:**

- Shared element transitions between any two views (same screen or cross-screen)
- Snapshot capture and coordinate mapping via Fabric APIs
- Reanimated-compatible primitives for custom animations
- Navigation-agnostic core (works with any router or custom solution)
- Native performance via Nitro Modules (zero-bridge overhead)
- First-class Expo and bare workflow support

**How it works:**

1. Mark elements with transition identifiers
2. Trigger a transition (navigation, state change, etc.)
3. Library captures snapshots and coordinates
4. You define the animation using Reanimated

This library handles the "what" and "where". You control the "how".

## What This Library Does NOT Do

This library is deliberately minimal. It will **not**:

❌ Ship with pre-built animation presets or "magic" transitions  
❌ Provide navigation components or routing logic  
❌ Support React Native < 0.76 (Old Architecture)  
❌ Use deprecated APIs (`UIManager`, `findNodeHandle`, etc.)  
❌ Bundle Reanimated (it's a peer dependency)  
❌ Handle navigation lifecycle (that's your router's job)  
❌ Work in Expo Go (Dev Client required)  

If you want batteries-included transitions with zero configuration, this isn't the library for you.

If you want full control over your animations and are building for the future of React Native, keep reading.

## Why This Library Exists

React Native already has shared element solutions. Why another one?

### The Landscape

**react-native-shared-element** (most popular):
- Built for the Old Architecture (Paper renderer)
- Uses deprecated APIs (`UIManager.measure`, `findNodeHandle`)
- Tightly coupled to React Navigation
- Large API surface with built-in animation logic

**react-native-reanimated** (has `SharedTransition`):
- Layout animation focused, not true shared element transitions
- No cross-screen snapshot handling
- Different use case

### Why We Built This

| Aspect | react-native-shared-element | react-native-shared-transition |
|--------|----------------------------|-------------------------------|
| **Architecture** | Old (deprecated APIs) | New (Fabric-native) |
| **Navigation** | React Navigation only | Any router |
| **Animation** | Built-in presets | Reanimated-first (you control) |
| **API Surface** | Large, opinionated | Minimal, composable |
| **Future** | Requires migration | Future-proof |

### Key Differentiators

**1. New Architecture First**

Not retrofitted. Built from the ground up for Fabric. This means:
- No deprecated APIs to migrate away from later
- Native performance characteristics
- Proper integration with Fabric's rendering pipeline

**2. Reanimated as the Animation Layer**

We don't compete with Reanimated—we extend it. This library provides:
- Snapshot capture
- Coordinate mapping
- Transition orchestration

You provide the animation using Reanimated's worklets. Want a scale + fade? Write it. Want a morph with spring physics? Write it. No fighting with preset configurations.

**3. Navigation Agnostic**

Works with:
- React Navigation
- Expo Router
- React Native Navigation
- Your custom navigation solution
- No navigation at all (same-screen transitions)

The library exposes low-level primitives. Navigation integration is optional and external.

**4. Minimal API Surface**

Fewer components = easier to learn, harder to break.

Core API:
```typescript
<SharedElement id="hero-image">
  <Image source={...} />
</SharedElement>

<SharedTransition from="hero-image" to="detail-image">
  {(progress) => {
    // Your Reanimated animation here
  }}
</SharedTransition>
```

That's it. Everything else is Reanimated.

## Core Philosophy

### Developer Experience

Simple mental model:
1. Mark elements you want to transition
2. Trigger the transition (navigation, state, etc.)
3. Customize the animation with Reanimated

No magic. No hidden state. Full control.

### Performance

- Native-driven transitions via Nitro Modules
- Zero JavaScript bridge overhead during animation
- Fabric's measurement APIs for coordinate mapping
- Snapshots rendered on the native thread

60 FPS is the baseline, not the goal.

### Future-Proof

No deprecated APIs means no migration pain. When React Native evolves, this library evolves with it.

We're betting on:
- New Architecture becoming standard (RN 0.76+)
- Reanimated as the animation standard
- Fabric APIs remaining stable

### Composability

Primitives over presets. Build exactly what you need.

Want a hero image transition? Build it.  
Want a morphing card? Build it.  
Want something we haven't imagined? Build it.

The library gets out of your way.

## Technical Decisions

### Nitro Modules Over Turbo Modules

Nitro Modules provide better integration for view-related native code. Since shared transitions are inherently view-centric, Nitro is the better fit.

### Reanimated as Peer Dependency

Bundling Reanimated would:
- Increase package size
- Create version conflicts
- Limit flexibility

By making it a peer dependency, you control the version and we avoid conflicts.

### Snapshot-Based Approach

Cross-screen transitions require capturing the source view's appearance. We use native snapshot APIs rather than trying to keep the source view mounted during navigation.

Pros:
- Works with any navigation pattern
- No layout thrashing
- Predictable memory usage

Cons:
- Snapshot capture has a small upfront cost
- Doesn't work for truly dynamic content (video, WebGL)

For 99% of use cases (images, text, containers), snapshots are perfect.

### Fabric Measurement APIs

No `findNodeHandle`. No `UIManager.measure`. 

Fabric provides proper APIs for coordinate mapping. We use them.

## Who This Library Is For

✅ You're building a new React Native app on 0.76+  
✅ You're migrating to the New Architecture  
✅ You want full control over transition animations  
✅ You're comfortable with Reanimated  
✅ You value simplicity and composability  

❌ You need to support RN < 0.76  
❌ You want zero-config transitions  
❌ You haven't used Reanimated before  
❌ You need web support  

## Contributing Philosophy

We value:
- Stability over features
- Performance over convenience
- Composability over presets

Feature requests for animation presets will be closed. This is a primitives library.

Bug reports and performance improvements are always welcome.

---

**Next:** See [support.md](./support.md) for platform and version requirements.

