import { TransitionCoordinator } from '../TransitionCoordinator';
import { SharedElementRegistry } from '../SharedElementRegistry';
import { getNativeModule } from '../native/NativeModule';
import type { MeasuredFrame } from '../specs/SharedTransitionModule.nitro';

jest.mock('../native/NativeModule', () => {
  const frames = new Map<string, MeasuredFrame>();
  const hidden = new Set<string>();
  const mockModule = {
    __frames: frames,
    __hidden: hidden,
    measureNode: jest.fn((nativeId: string) => {
      const frame = frames.get(nativeId);
      return frame
        ? Promise.resolve(frame)
        : Promise.reject(new Error(`no frame for ${nativeId}`));
    }),
    captureSnapshot: jest.fn(),
    setNodeHidden: jest.fn((nativeId: string, isHidden: boolean) => {
      if (isHidden) hidden.add(nativeId);
      else hidden.delete(nativeId);
    }),
    cleanup: jest.fn(() => hidden.clear()),
  };
  return {
    getNativeModule: () => mockModule,
    isNativeModuleAvailable: () => true,
  };
});

// requestAnimationFrame shim for the retry/finalize paths.
beforeAll(() => {
  (global as any).requestAnimationFrame = (cb: () => void) => setTimeout(cb, 0);
});

const native = getNativeModule() as any;

function makeRecord(id: string, nativeId: string, layoutReady = true) {
  return {
    id,
    nativeId,
    element: null,
    borderRadius: 0,
    borderWidth: 0,
    borderColor: undefined,
    config: undefined,
    layoutReady,
  };
}

function flush(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

const FRAME_A: MeasuredFrame = { x: 10, y: 20, width: 100, height: 100 };
const FRAME_B: MeasuredFrame = { x: 50, y: 200, width: 250, height: 250 };

describe('TransitionCoordinator', () => {
  beforeEach(() => {
    TransitionCoordinator.attach();
    native.__frames.clear();
    native.__hidden.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    TransitionCoordinator.detach();
    SharedElementRegistry.clear();
  });

  it('starts a forward transition when a pair mounts', async () => {
    native.__frames.set('a', FRAME_A);
    native.__frames.set('b', FRAME_B);

    SharedElementRegistry.register(makeRecord('hero', 'a'));
    SharedElementRegistry.register(makeRecord('hero', 'b'));
    await flush();

    const entries = TransitionCoordinator.getEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0]!.direction).toBe('forward');
    expect(entries[0]!.from).toEqual(FRAME_A);
    expect(entries[0]!.to).toEqual(FRAME_B);
    expect(TransitionCoordinator.isActive('hero')).toBe(true);
  });

  it('does nothing for a single element', async () => {
    native.__frames.set('a', FRAME_A);
    SharedElementRegistry.register(makeRecord('hero', 'a'));
    await flush();
    expect(TransitionCoordinator.getEntries()).toHaveLength(0);
  });

  it('waits for layout before starting', async () => {
    native.__frames.set('a', FRAME_A);
    native.__frames.set('b', FRAME_B);

    SharedElementRegistry.register(makeRecord('hero', 'a'));
    SharedElementRegistry.register(makeRecord('hero', 'b', false));
    await flush();
    expect(TransitionCoordinator.getEntries()).toHaveLength(0);

    SharedElementRegistry.markLayoutReady('b');
    await flush();
    expect(TransitionCoordinator.getEntries()).toHaveLength(1);
  });

  it('hides originals when the overlay reports ready, and restores them on completion', async () => {
    native.__frames.set('a', FRAME_A);
    native.__frames.set('b', FRAME_B);

    SharedElementRegistry.register(makeRecord('hero', 'a'));
    SharedElementRegistry.register(makeRecord('hero', 'b'));
    await flush();

    const entry = TransitionCoordinator.getEntries()[0]!;
    TransitionCoordinator.handleOverlayReady('hero', entry.generation);
    expect(native.__hidden).toEqual(new Set(['a', 'b']));

    TransitionCoordinator.handleComplete('hero', entry.generation);
    await flush();
    expect(native.__hidden.size).toBe(0);
    expect(TransitionCoordinator.getEntries()).toHaveLength(0);
    expect(TransitionCoordinator.isActive('hero')).toBe(false);
  });

  it('runs a return transition from the last known frame on unmount', async () => {
    native.__frames.set('a', FRAME_A);
    native.__frames.set('b', FRAME_B);

    SharedElementRegistry.register(makeRecord('hero', 'a'));
    SharedElementRegistry.register(makeRecord('hero', 'b'));
    await flush();

    // Complete the forward flight.
    const forward = TransitionCoordinator.getEntries()[0]!;
    TransitionCoordinator.handleComplete('hero', forward.generation);
    await flush();

    // Pop the screen: b unmounts.
    SharedElementRegistry.unregister('b');
    await flush();

    const entries = TransitionCoordinator.getEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0]!.direction).toBe('back');
    expect(entries[0]!.from).toEqual(FRAME_B);
    expect(entries[0]!.to).toEqual(FRAME_A);
  });

  it('ignores stale completions after a retarget', async () => {
    native.__frames.set('a', FRAME_A);
    native.__frames.set('b', FRAME_B);

    SharedElementRegistry.register(makeRecord('hero', 'a'));
    SharedElementRegistry.register(makeRecord('hero', 'b'));
    await flush();
    const first = TransitionCoordinator.getEntries()[0]!;

    // Interrupt mid-flight: b unmounts, retargeting back to a.
    SharedElementRegistry.unregister('b');
    await flush();
    const second = TransitionCoordinator.getEntries()[0]!;
    expect(second.generation).toBeGreaterThan(first.generation);
    expect(second.key).toBe(first.key); // same overlay instance

    // A completion from the outdated generation must be ignored.
    TransitionCoordinator.handleComplete('hero', first.generation);
    await flush();
    expect(TransitionCoordinator.getEntries()).toHaveLength(1);

    TransitionCoordinator.handleComplete('hero', second.generation);
    await flush();
    expect(TransitionCoordinator.getEntries()).toHaveLength(0);
  });

  it('drops the overlay when every element for an id is gone', async () => {
    native.__frames.set('a', FRAME_A);
    native.__frames.set('b', FRAME_B);

    SharedElementRegistry.register(makeRecord('hero', 'a'));
    SharedElementRegistry.register(makeRecord('hero', 'b'));
    await flush();
    expect(TransitionCoordinator.getEntries()).toHaveLength(1);

    SharedElementRegistry.unregister('b');
    await flush();
    SharedElementRegistry.unregister('a');
    await flush();
    expect(TransitionCoordinator.getEntries()).toHaveLength(0);
  });

  it('leaves unmounted elements hidden on completion', async () => {
    native.__frames.set('a', FRAME_A);
    native.__frames.set('b', FRAME_B);

    SharedElementRegistry.register(makeRecord('hero', 'a'));
    SharedElementRegistry.register(makeRecord('hero', 'b'));
    await flush();
    const forward = TransitionCoordinator.getEntries()[0]!;
    TransitionCoordinator.handleComplete('hero', forward.generation);
    await flush();

    SharedElementRegistry.unregister('b');
    await flush();
    const back = TransitionCoordinator.getEntries()[0]!;
    TransitionCoordinator.handleOverlayReady('hero', back.generation);
    expect(native.__hidden.has('a')).toBe(true);

    TransitionCoordinator.handleComplete('hero', back.generation);
    await flush();
    // 'a' is still mounted → restored. 'b' unmounted → left hidden.
    expect(native.__hidden.has('a')).toBe(false);
  });

  it('notifies state subscribers on start and end', async () => {
    native.__frames.set('a', FRAME_A);
    native.__frames.set('b', FRAME_B);

    const events: Array<[string, boolean]> = [];
    const unsubscribe = TransitionCoordinator.subscribeState((id, active) => {
      events.push([id, active]);
    });

    SharedElementRegistry.register(makeRecord('hero', 'a'));
    SharedElementRegistry.register(makeRecord('hero', 'b'));
    await flush();
    const entry = TransitionCoordinator.getEntries()[0]!;
    TransitionCoordinator.handleComplete('hero', entry.generation);
    await flush();

    expect(events).toEqual([
      ['hero', true],
      ['hero', false],
    ]);
    unsubscribe();
  });
});
