# react-native-shared-transition

**Native shared element transition primitives for React Native** 💫

Modern, performant shared element transitions built on:
- 🚀 **Nitro Modules** - Ultra-fast native bridge
- ⚡ **React Native New Architecture** - Fabric & TurboModules
- 🎬 **react-native-reanimated v4** - 60fps UI thread animations

---

## Table of Contents

1. [What is Shared Element Transition?](#what-is-shared-element-transition)
2. [What is Transition?](#what-is-transition)
3. [Comparison with react-native-shared-element](#comparison-with-react-native-shared-element)
4. [Installation](#installation)
5. [API Reference](#api-reference)
6. [Usage Guide](#usage-guide)
7. [Integration with React Navigation](#integration-with-react-navigation)
8. [FAQ](#faq)

---

## What is Shared Element Transition?

**Shared Element Transition** (còn gọi là Hero Animation) là kỹ thuật animation nơi một element (hình ảnh, text, card, etc.) "di chuyển" liền mạch từ màn hình này sang màn hình khác.

### Ví dụ thực tế:
- Bấm vào thumbnail → Hình ảnh "bay" lên và mở rộng thành full-screen
- Bấm vào avatar trong list → Avatar "chuyển" sang profile screen
- Bấm vào card → Card mở rộng thành detail view

### Cách hoạt động:

```
┌─────────────────┐          ┌─────────────────┐
│  Screen A       │          │  Screen B       │
│  ┌─────┐        │          │                 │
│  │ IMG │ ───────┼──────────┼─▶ ┌───────────┐ │
│  └─────┘        │ Animate  │   │    IMG    │ │
│  Title          │ ───────▶ │   └───────────┘ │
│                 │          │   Title         │
└─────────────────┘          └─────────────────┘
```

Thư viện này:
1. **Đo lường** vị trí và kích thước của element ở cả 2 screens
2. **Capture** snapshot của element
3. **Ẩn** các element gốc
4. **Animate** snapshot từ vị trí A sang vị trí B
5. **Hiện lại** element gốc khi animation kết thúc

---

## What is Transition?

Trong context của thư viện này, có **2 loại transition khác nhau**:

### 1. Screen Transition (Navigation Animation)

Đây là animation của **toàn bộ màn hình** khi navigate:
- Slide from right (iOS style)
- Fade in
- Scale center (Android Q style)

**⚠️ QUAN TRỌNG**: Screen transitions **KHÔNG** nằm trong thư viện `react-native-shared-transition`. Đây là code bạn tự viết hoặc do navigation library (React Navigation) cung cấp.

```typescript
// Đây là CUSTOM CODE, không phải từ thư viện
const screenTransitions = {
  slideFromRight: { transform: [{ translateX }] },
  fadeIn: { opacity },
  scaleCenter: { transform: [{ scale }] },
};
```

### 2. Shared Element Transition

Đây là animation của **các element cụ thể** giữa 2 screens:
- `move` - Element di chuyển từ A sang B
- `fade` - Cross-fade giữa 2 elements
- `fade-in` - Element đích fade in
- `fade-out` - Element nguồn fade out

**✅ ĐÂY** là chức năng chính của thư viện `react-native-shared-transition`.

```typescript
// Đây là từ thư viện
import { SharedElement, SharedElementTransition } from 'react-native-shared-transition';
```

### Tóm tắt:

| Loại | Thuộc về | Mô tả |
|------|----------|-------|
| Screen Transition | Custom code / React Navigation | Animation toàn màn hình |
| Shared Element | `react-native-shared-transition` | Animation element cụ thể |

---

## Comparison with react-native-shared-element

| Feature | react-native-shared-element | react-native-shared-transition |
|---------|----------------------------|-------------------------------|
| **Architecture** | Old Architecture | New Architecture (Fabric, TurboModules) |
| **Native Bridge** | React Native Bridge | Nitro Modules (nhanh hơn ~10x) |
| **Animation Engine** | RN Animated | Support cả RN Animated & Reanimated v4 |
| **Type Safety** | Partial | Full TypeScript + Codegen |
| **Maintenance** | Looking for maintainers | Active |
| **iOS** | UIKit | UIKit + SwiftUI ready |
| **Android** | Java | Kotlin |
| **Performance** | Good | Excellent (UI thread animations) |

### API Comparison:

```typescript
// react-native-shared-element (cũ)
import { SharedElement, SharedElementTransition } from 'react-native-shared-element';

<SharedElement id="image" navigation={navigation}>
  <Image source={...} />
</SharedElement>

// react-native-shared-transition (mới)
import { SharedElement, SharedElementTransition } from 'react-native-shared-transition';

<SharedElement id="image">
  <Image source={...} />
</SharedElement>
```

**Điểm khác biệt chính:**
1. Không cần `navigation` prop - tự động detect context
2. Support Reanimated SharedValue cho `position`
3. Faster native measurements với Nitro Modules
4. TypeScript-first API

---

## Installation

```bash
# npm
npm install react-native-shared-transition react-native-nitro-modules react-native-reanimated

# yarn
yarn add react-native-shared-transition react-native-nitro-modules react-native-reanimated

# pnpm
pnpm add react-native-shared-transition react-native-nitro-modules react-native-reanimated
```

### iOS
```bash
cd ios && pod install
```

### Requirements
- React Native >= 0.76.0
- New Architecture enabled
- react-native-reanimated >= 4.0.0
- react-native-nitro-modules >= 0.32.0

---

## API Reference

### `<SharedElement>`

Wrap element cần shared transition.

```tsx
import { SharedElement } from 'react-native-shared-transition';

<SharedElement id="hero-image">
  <Image source={{ uri: 'https://...' }} />
</SharedElement>
```

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | ✅ | Unique identifier cho shared element |
| `children` | `ReactNode` | ✅ | Child element (must be a single View) |
| `style` | `ViewStyle` | ❌ | Container style |
| `onNode` | `(node) => void` | ❌ | Callback khi node được mount |

### `<SharedElementTransition>`

Thực hiện transition giữa 2 shared elements.

```tsx
import { SharedElementTransition } from 'react-native-shared-transition';

<SharedElementTransition
  start={{ node: startNode, ancestor: startAncestor }}
  end={{ node: endNode, ancestor: endAncestor }}
  position={animatedValue} // 0 = start, 1 = end
  animation="move"
  resize="auto"
  align="auto"
/>
```

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `start` | `TransitionEndpoint` | ✅ | Start node và ancestor |
| `end` | `TransitionEndpoint` | ✅ | End node và ancestor |
| `position` | `SharedValue<number>` \| `Animated.Value` \| `number` | ✅ | Animation progress (0-1) |
| `animation` | `'move'` \| `'fade'` \| `'fade-in'` \| `'fade-out'` | ❌ | Animation type |
| `resize` | `'auto'` \| `'stretch'` \| `'clip'` \| `'none'` | ❌ | Resize behavior |
| `align` | `'auto'` \| `'center-center'` \| ... | ❌ | Alignment |
| `debug` | `boolean` | ❌ | Show debug overlay |

### Animation Types

| Type | Description |
|------|-------------|
| `move` | Di chuyển element từ start → end |
| `fade` | Cross-fade giữa start và end |
| `fade-in` | Fade in element đích từ vị trí start |
| `fade-out` | Fade out element nguồn đến vị trí end |

### Resize Types

| Type | Description |
|------|-------------|
| `auto` | Tự động chọn resize tốt nhất (recommended) |
| `stretch` | Stretch để fit kích thước mới |
| `clip` | Clip content, không resize (good for text) |
| `none` | Không resize |

---

## Usage Guide

### Basic Usage

```tsx
// ListScreen.tsx
import { SharedElement } from 'react-native-shared-transition';

function ListScreen() {
  return (
    <FlatList
      data={items}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => navigateToDetail(item)}>
          <SharedElement id={`item.${item.id}.photo`}>
            <Image source={{ uri: item.photo }} style={styles.thumbnail} />
          </SharedElement>
          <Text>{item.title}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

// DetailScreen.tsx
function DetailScreen({ item }) {
  return (
    <View>
      <SharedElement id={`item.${item.id}.photo`}>
        <Image source={{ uri: item.photo }} style={styles.hero} />
      </SharedElement>
      <Text>{item.title}</Text>
    </View>
  );
}
```

### Custom Router Integration

Thư viện này là **primitives** - cung cấp các building blocks. Bạn cần một Router để orchestrate transitions.

Xem `example/src/components/Router.tsx` cho ví dụ implementation.

```tsx
// Basic flow:
// 1. Collect SharedElement nodes từ cả 2 screens
// 2. Khi transition bắt đầu, render SharedElementTransition overlay
// 3. Animate position từ 0 → 1
// 4. Khi xong, cleanup overlay
```

---

## Integration with React Navigation

### Câu hỏi: Có thể dùng với React Navigation không?

**Có!** Nhưng bạn cần custom code để integrate.

### Cách 1: Custom TransitionPresets

```tsx
// navigation/SharedElementTransition.tsx
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { SharedElement, SharedElementTransition } from 'react-native-shared-transition';

const Stack = createStackNavigator();

// Custom screen transition (KHÔNG phải shared element)
const customTransition = {
  gestureDirection: 'horizontal',
  transitionSpec: {
    open: { animation: 'timing', config: { duration: 400 } },
    close: { animation: 'timing', config: { duration: 400 } },
  },
  cardStyleInterpolator: ({ current }) => ({
    cardStyle: {
      opacity: current.progress,
    },
  }),
};

function Navigator() {
  return (
    <Stack.Navigator screenOptions={customTransition}>
      <Stack.Screen name="List" component={ListScreen} />
      <Stack.Screen name="Detail" component={DetailScreen} />
    </Stack.Navigator>
  );
}
```

### Cách 2: Sử dụng react-navigation-shared-element

Có thể dùng pattern tương tự như [react-navigation-shared-element](https://github.com/IjzerenHein/react-navigation-shared-element) nhưng với thư viện này làm backend.

---

## FAQ

### Q: Animation khi navigate là từ thư viện này không?

**A: KHÔNG.** Screen transitions (slide, fade, scale) là từ:
- Custom code bạn tự viết
- React Navigation's `cardStyleInterpolator`
- Hoặc bất kỳ navigation library nào bạn dùng

Thư viện `react-native-shared-transition` chỉ cung cấp:
- `<SharedElement>` - Mark elements for transition
- `<SharedElementTransition>` - Render the transition overlay
- Native utilities để measure và capture snapshots

### Q: Tại sao cần 2 thư viện (navigation + shared element)?

**A:** Vì chúng làm 2 việc khác nhau:
- **Navigation library**: Quản lý screen stack, URL, params, screen transitions
- **Shared element library**: Animate elements cụ thể giữa screens

### Q: Reanimated v4 có bắt buộc không?

**A:** Không bắt buộc, thư viện hỗ trợ cả:
- `react-native` `Animated` API (built-in)
- `react-native-reanimated` `SharedValue` (recommended for performance)

### Q: Khác gì với reanimated's `sharedTransitionTag`?

**A:** 
- `sharedTransitionTag`: Chỉ hoạt động trong Reanimated's Layout Animations context
- `react-native-shared-transition`: Flexible, works với bất kỳ navigation system nào

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    JavaScript Layer                          │
├─────────────────────────────────────────────────────────────┤
│  SharedElement          SharedElementTransition              │
│  (React Component)      (React Component)                    │
│         │                      │                             │
│         ▼                      ▼                             │
│  SharedElementRegistry  Animation (Reanimated/RN Animated)   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Nitro Modules Bridge                      │
├─────────────────────────────────────────────────────────────┤
│  SharedTransitionModule (HybridObject)                       │
│  - measureNode()                                             │
│  - captureSnapshot()                                         │
│  - setNodeHidden()                                           │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Native Layer                              │
├──────────────────────┬──────────────────────────────────────┤
│       iOS (Swift)    │          Android (Kotlin)            │
│  - UIView.snapshot() │  - View.drawToBitmap()               │
│  - UIView.frame      │  - View.getLocationOnScreen()        │
└──────────────────────┴──────────────────────────────────────┘
```

---

## License

MIT © 2024

---

## Credits

Inspired by [react-native-shared-element](https://github.com/IjzerenHein/react-native-shared-element) by IjzerenHein.

Built with ❤️ using:
- [Nitro Modules](https://github.com/margelo/react-native-nitro-modules)
- [React Native Reanimated](https://github.com/software-mansion/react-native-reanimated)
