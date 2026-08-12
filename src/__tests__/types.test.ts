import { DEFAULT_TRANSITION_CONFIG, resolveTransitionConfig } from '../types';

describe('resolveTransitionConfig', () => {
  it('returns defaults when called without overrides', () => {
    const config = resolveTransitionConfig();
    expect(config).toEqual(DEFAULT_TRANSITION_CONFIG);
    // Must be a copy, not the shared default object.
    expect(config).not.toBe(DEFAULT_TRANSITION_CONFIG);
    expect(config.spring).not.toBe(DEFAULT_TRANSITION_CONFIG.spring);
  });

  it('applies overrides on top of defaults', () => {
    const config = resolveTransitionConfig({
      animation: 'timing',
      duration: 500,
    });
    expect(config.animation).toBe('timing');
    expect(config.duration).toBe(500);
    expect(config.crossFade).toBe(DEFAULT_TRANSITION_CONFIG.crossFade);
  });

  it('deep-merges spring config', () => {
    const config = resolveTransitionConfig({ spring: { damping: 10 } });
    expect(config.spring.damping).toBe(10);
    expect(config.spring.stiffness).toBe(
      DEFAULT_TRANSITION_CONFIG.spring.stiffness
    );
  });

  it('lets later configs win', () => {
    const config = resolveTransitionConfig(
      { duration: 100, crossFade: true },
      { duration: 200 },
      undefined,
      { spring: { mass: 2 } }
    );
    expect(config.duration).toBe(200);
    expect(config.crossFade).toBe(true);
    expect(config.spring.mass).toBe(2);
  });

  it('ignores explicit undefined values', () => {
    const config = resolveTransitionConfig({ duration: undefined });
    expect(config.duration).toBe(DEFAULT_TRANSITION_CONFIG.duration);
  });
});
