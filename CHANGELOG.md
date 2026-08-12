# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1] - 2026-08-12

A pre-release audit pass: one transition-breaking bug, several correctness and
lifecycle fixes, and diagnostics for the failure modes that were previously
silent. No API changes.

### Fixed

- **Transitions could end on the first frame.** The completion callback was
  attached to the animated `width`. Reanimated's spring settles immediately when
  its start and end values are equal (zero initial energy), so any transition
  where the source and target widths matched — a full-bleed image morphing into
  another full-bleed image, a fixed-size element that only moves — reported
  completion ~16 ms in. The originals were revealed while position, height and
  radius were still in flight, which read as the element snapping into place.
  Completion is now driven by a dedicated progress value that always travels
  0 → 1, so it is independent of the geometry being animated.
- **Unhandled promise rejection when a transition failed to start.** The Nitro
  spec declares `measureNode` as throwing, so a synchronous throw escaped the
  `.catch()` attached to its result and surfaced as an unhandled rejection from
  the fire-and-forget call sites.
- **`<SharedElement>` could re-register itself on a re-render.** Its `nativeID`
  was derived with `useMemo`, which is explicitly not a caching guarantee. If
  React discarded the memo the element unregistered and re-registered, which a
  mounted partner saw as a spurious back-then-forward transition.
- **A detached host leaked its config.** `detach()` left `defaultConfig` set, so
  a later `<SharedTransitionHost>` mounted without a `config` prop inherited the
  previous host's settings instead of the library defaults.
- **Android: overlays were offset by the status bar height.** `measureNode`
  returned window coordinates, but overlays are positioned inside React Native's
  root view — a child of `android.R.id.content`, which is inset below the status
  bar unless the host app makes it translucent. Measurements are now relative to
  the content root, which is a no-op for apps that already use a translucent
  status bar.
- **Android: `captureSnapshot` leaked its bitmap on every error path.** A
  full-screen `ARGB_8888` bitmap is several megabytes and was only recycled on
  the success path; it is now recycled in a `finally` block.
- **Android: `ActivityHolder` was read across threads without synchronisation.**
  `activityRef` and `isInitialized` are written from the main thread but read
  from the promise coroutine; both are now `@Volatile`, and `init()` is
  `@Synchronized`.

### Added

- Development-mode warnings for the paths that used to fail silently: a node
  that never measures, a transition that throws while starting, and an id that
  is mounted on more than two elements at once (which means it is not unique per
  screen and the coordinator will pair the wrong two).

### Changed

- Android now compiles with `sourceCompatibility`/`targetCompatibility` 17 and
  `kotlinOptions.jvmTarget = "17"`, matching the React Native 0.83 toolchain.
  The previous Java 8 target with no matching Kotlin JVM target is a common
  cause of "Inconsistent JVM-target compatibility" failures in consumer builds.
- `package.json` declares `sideEffects: false` and `engines.node >= 20`, and no
  longer lists `cpp` or `react-native.config.js` in `files` — neither exists.
  The podspec no longer globs a non-existent `cpp/` directory.

### Documentation

- Corrected the default spring in `docs/api.md`: it is
  `{ damping: 24, stiffness: 220, mass: 1, overshootClamping: false }`, not
  `{ damping: 26, stiffness: 290, ... }`.
- Corrected the claim that measurement is transform-aware. It is on iOS; on
  Android the layout box is reported, so an element mid-`scale` measures its
  unscaled size.
- Rewrote the example-app section to describe the current demo.

### Example

- Replaced all bundled artwork with photographs from Unsplash under the
  [Unsplash License](https://unsplash.com/license), which permits commercial use
  without attribution. Provenance for every file is recorded in
  `example/src/assets/CREDITS.md`.
- Rebuilt the example as a dark-first photo gallery with a design-token system,
  a hero card plus a balanced masonry grid, an immersive detail screen, and a
  segmented control that switches the app-wide transition config between a
  spring, a timing curve and an under-damped spring.

## [0.2.0] - 2025-12-29

Initial public release.
