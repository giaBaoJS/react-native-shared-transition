# React Navigation Example

This example demonstrates the basic integration of `react-native-shared-transition` with React Navigation.

## Setup

```bash
cd example

# Install dependencies
yarn install

# iOS
cd ios && bundle install && bundle exec pod install && cd ..

# Start Metro
yarn start

# Run iOS
yarn ios

# Run Android
yarn android
```

## Structure

```
example/
├── src/
│   ├── App.tsx                 # Entry with NavigationContainer
│   ├── assets/                 # Hero images
│   ├── navigation/
│   │   ├── types.ts            # Navigation types
│   │   └── RootNavigator.tsx   # Stack navigator
│   ├── screens/
│   │   ├── HomeScreen.tsx      # List with SharedElement
│   │   └── DetailScreen.tsx    # Detail with SharedElement
│   └── types/
│       └── index.ts            # Type definitions
├── ios/                        # iOS native project
├── android/                    # Android native project
└── ...
```

## How It Works

1. Wrap elements with `<SharedElement id="...">` in both screens
2. Use matching IDs to connect elements
3. The library tracks and can animate between them

```tsx
// HomeScreen.tsx
<SharedElement id={`hero.${item.id}.photo`}>
  <Image source={item.photo} />
</SharedElement>

// DetailScreen.tsx
<SharedElement id={`hero.${item.id}.photo`}>
  <Image source={item.photo} />
</SharedElement>
```
