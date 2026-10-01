// Derived from pinned upstream mergeProps.test.ts:499. Assertions and test body unchanged; import/mount infrastructure only adapted. MIT.
import { it, expect } from 'vitest';
import { mergeProps } from '../src/lib/merge-props/index.js';

    it('does not mutate a reused object returned by the first props getter', () => {
      const shared = { className: 'base' };

      const result = mergeProps(() => shared, {
        className: 'next',
      });

      expect(result).toEqual({
        className: 'next base',
      });
      expect(shared).toEqual({
        className: 'base',
      });
    });
