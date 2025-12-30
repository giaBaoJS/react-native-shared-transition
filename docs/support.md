# Platform & Version Support

## Minimum Requirements

| Dependency | Minimum Version | Notes |
|------------|----------------|-------|
| **React Native** | **0.76.0** | New Architecture required |
| **React** | **18.2.0** | React 19+ recommended |
| **Reanimated** | **3.6.0** | Peer dependency, must be installed |
| **Nitro Modules** | **0.32.0** | Peer dependency, must be installed |
| **Node** | **20.0.0** | For build tooling |

## Platform Support

| Platform | Status | Minimum Version |
|----------|--------|----------------|
| iOS | ✅ Supported | iOS 13.4+ |
| Android | ✅ Supported | API 23+ (Android 6.0) |
| Web | ❌ Not supported | N/A |
| Windows | ❌ Not supported | N/A |
| macOS | ❌ Not supported | N/A |

**No plans to support web or out-of-tree platforms.**

## Architecture Requirements

This library **ONLY** supports the New Architecture (Fabric + TurboModules).

✅ **New Architecture (Fabric)**  
❌ **Old Architecture (Paper)**

### Why?

The Old Architecture uses deprecated APIs that will be removed from React Native. Building on deprecated foundations is technical debt.

### What if I'm still on Old Architecture?

You have two options:

1. **Migrate to New Architecture** (recommended)
   - Follow the [official migration guide](https://reactnative.dev/docs/new-architecture-intro)
   - RN 0.76+ enables New Architecture by default

2. **Use react-native-shared-element instead**
   - Mature library for Old Architecture
   - No plans to deprecate (community maintained)

## Expo Support

| Setup | Status | Notes |
|-------|--------|-------|
| **Expo Dev Client** | ✅ Supported | SDK 52+ |
| **Expo Go** | ❌ Not supported | Cannot load native modules |
| **Expo Prebuild** | ✅ Supported | Recommended workflow |

### Why not Expo Go?

Expo Go is a pre-built binary that cannot load third-party native modules. This library uses Nitro Modules, which require custom native code.

### Setup for Expo

```bash
# Install dependencies
npx expo install react-native-shared-transition react-native-nitro-modules react-native-reanimated

# Generate native folders
npx expo prebuild

# Build development client
npx expo run:ios
# or
npx expo run:android
```

**Minimum Expo SDK:** 52

## Navigation Library Support

This library is **navigation-agnostic**. It works with any navigation solution:

✅ React Navigation 6+  
✅ Expo Router  
✅ React Native Navigation (Wix)  
✅ Custom navigation solutions  
✅ No navigation (same-screen transitions)

**You are responsible for navigation integration.** The library provides primitives; wiring them to your router is your job.

### React Navigation Notes

If using with React Navigation, ensure:
- `react-native-screens` >= 3.30.0
- Fabric mode enabled for screens

### Expo Router Notes

Expo Router works out of the box. Use the library's primitives in your route transitions.

## Tested Compatibility Matrix

| React Native | Reanimated | Expo SDK | Nitro Modules | Status |
|--------------|------------|----------|---------------|--------|
| 0.83.x | 3.16.x | 53 | 0.32.x | ✅ Fully tested |
| 0.76.x | 3.6.x | 52 | 0.32.x | ✅ Supported |
| < 0.76 | Any | Any | Any | ❌ **Unsupported** |

## What is NOT Supported

Clear and unambiguous:

❌ React Native < 0.76  
❌ Old Architecture (Paper renderer)  
❌ Expo Go (use Dev Client)  
❌ Reanimated < 3.6.0  
❌ react-native-screens < 3.30 (if using React Navigation)  
❌ Web / React Native Web  
❌ Out-of-tree platforms (Windows, macOS, tvOS)  
❌ Hermes < RN 0.76 default version  

**No plans to support these. PRs for unsupported platforms will be closed.**

## Common Issues

### "Cannot find module 'react-native-nitro-modules'"

**Solution:** Install peer dependencies.

```bash
npm install react-native-nitro-modules react-native-reanimated
# or
yarn add react-native-nitro-modules react-native-reanimated
```

### "Fabric is not enabled"

**Solution:** Enable New Architecture.

For RN 0.76+, it's enabled by default. If you disabled it, re-enable:

**iOS** (`ios/Podfile`):
```ruby
use_frameworks! :linkage => :static
```

**Android** (`android/gradle.properties`):
```properties
newArchEnabled=true
```

### "Module `SharedTransition` requires main queue setup"

**Solution:** Rebuild your app after installing.

```bash
# iOS
cd ios && pod install && cd ..
npx react-native run-ios

# Android
npx react-native run-android
```

### "Cannot use in Expo Go"

**Solution:** Use Expo Dev Client.

```bash
npx expo prebuild
npx expo run:ios
```

Expo Go cannot load third-party native modules. This is an Expo limitation, not a library bug.

### "Animation is janky"

**Check:**
1. Is Reanimated properly configured? (`react-native-reanimated/plugin` in `babel.config.js`)
2. Are you using worklets for animations? (animations must run on UI thread)
3. Is the New Architecture enabled?

### "Snapshots are blurry"

**Solution:** Ensure high-resolution snapshots.

The library captures snapshots at native resolution, but if source views render at low resolution, snapshots will inherit that.

Check:
- Image source resolution
- Device pixel ratio handling
- View dimensions during snapshot

## Version Policy

This library follows semantic versioning:

- **Major:** Breaking API changes
- **Minor:** New features (backwards compatible)
- **Patch:** Bug fixes

**Stability commitment:**
- Core API will remain stable across minor versions
- No breaking changes without major version bump
- Deprecations announced at least one major version in advance

## Upgrading

### From 0.x to 1.0

Not yet released. Breaking changes will be documented when 1.0 ships.

### React Native Upgrades

When upgrading React Native:
1. Check the compatibility matrix above
2. Upgrade Reanimated to a compatible version
3. Test transitions in your app
4. Report issues on GitHub

## Getting Help

**Before opening an issue:**

1. Verify you meet minimum requirements (check this doc)
2. Ensure New Architecture is enabled
3. Confirm Reanimated is properly configured
4. Search existing issues

**When opening an issue, include:**
- React Native version
- Reanimated version
- Expo SDK version (if applicable)
- Minimal reproducible example

**We will close issues without:**
- Version information
- Reproducible example
- Support for unsupported setups (RN < 0.76, Expo Go, etc.)

---

**Next:** See [decisions.md](./decisions.md) for product philosophy and technical decisions.

