import { describe, expect, it } from 'vitest';

import { combineQueryStatus } from './query-status';

const ok = { isPending: false, isError: false };
const pending = { isPending: true, isError: false };
const failed = { isPending: false, isError: true };

describe('combineQueryStatus', () => {
  it.each([
    ['no queries', [], 'ready'],
    ['all loaded', [ok, ok], 'ready'],
    ['one pending', [ok, pending], 'loading'],
    ['one failed while another is pending', [pending, failed], 'error'],
  ] as const)('is %s → %s', (_, queries, expected) => {
    expect(combineQueryStatus([...queries])).toBe(expected);
  });
});
