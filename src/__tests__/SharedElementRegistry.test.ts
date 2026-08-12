import { SharedElementRegistry } from '../SharedElementRegistry';
import type { RegistryEvent } from '../SharedElementRegistry';

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

describe('SharedElementRegistry', () => {
  afterEach(() => {
    SharedElementRegistry.clear();
  });

  it('registers and unregisters records', () => {
    SharedElementRegistry.register(makeRecord('hero', 'a'));
    expect(SharedElementRegistry.getRecord('a')).not.toBeNull();
    expect(SharedElementRegistry.getRecords('hero')).toHaveLength(1);

    SharedElementRegistry.unregister('a');
    expect(SharedElementRegistry.getRecord('a')).toBeNull();
    expect(SharedElementRegistry.getRecords('hero')).toHaveLength(0);
  });

  it('assigns monotonically increasing sequences', () => {
    const first = SharedElementRegistry.register(makeRecord('hero', 'a'));
    const second = SharedElementRegistry.register(makeRecord('hero', 'b'));
    expect(second.sequence).toBeGreaterThan(first.sequence);
  });

  it('emits registered / unregistered events with remaining partner', () => {
    const events: RegistryEvent[] = [];
    const unsubscribe = SharedElementRegistry.subscribe((e) => events.push(e));

    SharedElementRegistry.register(makeRecord('hero', 'a'));
    SharedElementRegistry.register(makeRecord('hero', 'b'));
    SharedElementRegistry.unregister('b');

    expect(events.map((e) => e.type)).toEqual([
      'registered',
      'registered',
      'unregistered',
    ]);
    const last = events[2];
    if (last?.type !== 'unregistered') throw new Error('unexpected event');
    expect(last.record.nativeId).toBe('b');
    expect(last.remaining?.nativeId).toBe('a');

    unsubscribe();
  });

  it('reports no remaining partner for the last element', () => {
    const events: RegistryEvent[] = [];
    SharedElementRegistry.register(makeRecord('hero', 'a'));
    const unsubscribe = SharedElementRegistry.subscribe((e) => events.push(e));
    SharedElementRegistry.unregister('a');
    const last = events[0];
    if (last?.type !== 'unregistered') throw new Error('unexpected event');
    expect(last.remaining).toBeNull();
    unsubscribe();
  });

  it('finds the newest partner of a record', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const a = SharedElementRegistry.register(makeRecord('hero', 'a'));
    const b = SharedElementRegistry.register(makeRecord('hero', 'b'));
    const c = SharedElementRegistry.register(makeRecord('hero', 'c'));

    expect(SharedElementRegistry.getPartnerOf(c)?.nativeId).toBe('b');
    expect(SharedElementRegistry.getPartnerOf(b)?.nativeId).toBe('c');
    expect(SharedElementRegistry.getPartnerOf(a)?.nativeId).toBe('c');
    warn.mockRestore();
  });

  it('warns when an id is mounted more than twice', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    // Two is the legitimate transition pair — source screen + destination.
    SharedElementRegistry.register(makeRecord('hero', 'a'));
    SharedElementRegistry.register(makeRecord('hero', 'b'));
    expect(warn).not.toHaveBeenCalled();

    // A third means the id is not unique per screen.
    SharedElementRegistry.register(makeRecord('hero', 'c'));
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        '3 elements are mounted with the shared id "hero"'
      )
    );

    warn.mockRestore();
  });

  it('returns null partner when alone', () => {
    const a = SharedElementRegistry.register(makeRecord('hero', 'a'));
    expect(SharedElementRegistry.getPartnerOf(a)).toBeNull();
  });

  it('does not mix ids', () => {
    const a = SharedElementRegistry.register(makeRecord('hero', 'a'));
    SharedElementRegistry.register(makeRecord('other', 'b'));
    expect(SharedElementRegistry.getPartnerOf(a)).toBeNull();
  });

  it('emits layout events only once per record', () => {
    const events: RegistryEvent[] = [];
    SharedElementRegistry.register(makeRecord('hero', 'a', false));
    const unsubscribe = SharedElementRegistry.subscribe((e) => events.push(e));

    SharedElementRegistry.markLayoutReady('a');
    SharedElementRegistry.markLayoutReady('a');

    expect(events.filter((e) => e.type === 'layout')).toHaveLength(1);
    expect(SharedElementRegistry.getRecord('a')?.layoutReady).toBe(true);
    unsubscribe();
  });

  it('stores last measured frames', () => {
    SharedElementRegistry.register(makeRecord('hero', 'a'));
    const frame = { x: 1, y: 2, width: 3, height: 4 };
    SharedElementRegistry.setLastFrame('a', frame);
    expect(SharedElementRegistry.getRecord('a')?.lastFrame).toEqual(frame);
  });

  it('updates mutable fields without changing identity', () => {
    const a = SharedElementRegistry.register(makeRecord('hero', 'a'));
    SharedElementRegistry.update('a', { borderRadius: 12 });
    expect(SharedElementRegistry.getRecord('a')).toBe(a);
    expect(a.borderRadius).toBe(12);
  });
});
