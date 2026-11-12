import { describe, expect, it } from 'vitest';

import { assert } from './assert.ts';

describe('assert', () => {
  it.each([null, undefined, ''])('throws for %j', (value) => {
    expect(() => assert(value)).toThrow(
      'to be defined and not an empty string'
    );
  });

  it.each([0, false, 'a'])('accepts %j', (value) => {
    expect(() => assert(value)).not.toThrow();
  });

  it('throws when the value is not of the requested type', () => {
    expect(() => assert(1, { type: 'string' })).toThrow(
      'to be of type string but was number'
    );
  });

  it('uses the custom message', () => {
    expect(() => assert(null, { msg: 'missing id' })).toThrow('missing id');
  });
});
