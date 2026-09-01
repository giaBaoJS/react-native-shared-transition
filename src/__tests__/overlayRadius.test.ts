import { resolveOverlayRadius } from '../overlayRadius';

describe('resolveOverlayRadius', () => {
  it('morphs from the source radius to the target radius', () => {
    expect(resolveOverlayRadius(true, 20, 110)).toEqual({
      start: 20,
      end: 110,
    });
  });

  it('holds the source radius when morphing is disabled', () => {
    expect(resolveOverlayRadius(false, 55, 12)).toEqual({
      start: 55,
      end: 55,
    });
  });

  it('keeps a circular source circular for the whole flight', () => {
    const { start, end } = resolveOverlayRadius(false, 32, 0);
    expect(start).toBe(32);
    expect(end).toBe(32);
  });

  it('leaves square endpoints square', () => {
    expect(resolveOverlayRadius(false, 0, 0)).toEqual({ start: 0, end: 0 });
    expect(resolveOverlayRadius(true, 0, 0)).toEqual({ start: 0, end: 0 });
  });
});
