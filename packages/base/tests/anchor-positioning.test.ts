import { describe, expect, it } from 'vitest';
import { createPositioningPolicy } from '../src/lib/internals/anchor-positioning/policy.js';
import type { AnchorPositioningOptions } from '../src/lib/internals/anchor-positioning/types.js';
const base: AnchorPositioningOptions = { open: true, mounted: true, collisionAvoidance: {} };
describe('supplemental positioning policy contracts', () => {
  it('keeps default engine policy and middleware order without a platform override', () => {
    const policy = createPositioningPolicy(base, () => null, () => true);
    expect(policy.placement).toBe('bottom');
    expect(policy.strategy).toBe('absolute');
    expect(policy).not.toHaveProperty('platform');
    expect(policy.middleware.map(item => item.name)).toEqual(['offset', 'shift', 'flip', 'size', 'arrow', 'transformOrigin', 'hide']);
    const aligned = createPositioningPolicy({ ...base, align: 'start' }, () => null, () => true);
    expect(aligned.middleware.map(item => item.name)).toEqual(['offset', 'flip', 'shift', 'size', 'arrow', 'transformOrigin', 'hide']);
  });
  it('resolves provider logical sides and maintains source flip bias separately from collision padding', () => {
    const policy = createPositioningPolicy({ ...base, side: 'inline-start', direction: 'rtl' }, () => null, () => true);
    expect(policy.placement).toBe('right');
    const bottom = createPositioningPolicy(base, () => null, () => true);
    expect(bottom.middleware.find(item => item.name === 'flip')?.options.padding).toEqual({ top: 7, right: 6, bottom: 6, left: 6 });
    expect(bottom.middleware.find(item => item.name === 'size')?.options.padding).toEqual({ top: 5, right: 5, bottom: 5, left: 5 });
  });
  it('honors disabled collisions and side-axis shift', () => {
    const none = createPositioningPolicy({ ...base, collisionAvoidance: { side: 'none', align: 'none' } }, () => null, () => true);
    expect(none.middleware.map(item => item.name)).not.toContain('shift');
    expect(none.middleware.map(item => item.name)).not.toContain('flip');
    const shifted = createPositioningPolicy({ ...base, collisionAvoidance: { side: 'shift', align: 'shift' } }, () => null, () => true);
    expect(shifted.middleware.find(item => item.name === 'shift')?.options.crossAxis).toBe(true);
  });
});
