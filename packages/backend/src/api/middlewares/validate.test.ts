import { ApiErrorCode } from '@jrposada/auroria-toolkit-shared/models/api-error-code';
import { weaponsGetQuerySchema } from '@jrposada/auroria-toolkit-shared/models/weapons/weapons-get';
import { weaponsGetByIdParamsSchema } from '@jrposada/auroria-toolkit-shared/models/weapons/weapons-get-by-id';
import type { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';

import { validateParams } from './validate-params.ts';
import { validateQuery } from './validate-query.ts';

const VALIDATION_FAILED = {
  success: false,
  data: { code: ApiErrorCode.ValidationFailed },
};

function fakeRes() {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });

  return { res: { status } as unknown as Response, status, json };
}

describe('validateQuery', () => {
  const middleware = validateQuery(weaponsGetQuerySchema);

  it('passes a valid query on and replaces it with the parsed value', () => {
    const req = {
      query: { class: 'warrior', type: 'Longsword', extra: 'x' },
    } as unknown as Request;
    const { res, status } = fakeRes();
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledExactlyOnceWith();
    expect(req.query).toEqual({ class: 'warrior', type: 'Longsword' });
    expect(status).not.toHaveBeenCalled();
  });

  it('accepts an empty query', () => {
    const next = vi.fn();

    middleware({ query: {} } as unknown as Request, fakeRes().res, next);

    expect(next).toHaveBeenCalledExactlyOnceWith();
  });

  it.each([
    { class: 'Warrior' },
    { class: '' },
    { type: ['Longsword', 'Greatsword'] },
  ])('answers 400 validation_failed for %j', (query) => {
    const { res, status, json } = fakeRes();
    const next = vi.fn();

    middleware({ query } as unknown as Request, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(VALIDATION_FAILED);
  });
});

describe('validateParams', () => {
  const middleware = validateParams(weaponsGetByIdParamsSchema);

  it('passes valid params on', () => {
    const next = vi.fn();

    middleware(
      { params: { id: 'scattered-mist' } } as unknown as Request,
      fakeRes().res,
      next
    );

    expect(next).toHaveBeenCalledExactlyOnceWith();
  });

  it('answers 400 validation_failed for an empty id', () => {
    const { res, status, json } = fakeRes();
    const next = vi.fn();

    middleware({ params: { id: '' } } as unknown as Request, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(VALIDATION_FAILED);
  });
});
