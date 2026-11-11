import { ApiErrorCode } from '@jrposada/auroria-toolkit-shared/models/api-error-code';
import type { Response } from 'express';
import { describe, expect, it, vi } from 'vitest';

import ResourceNotFound from '../../infrastructure/not-found-error.ts';
import ValidationError from '../../infrastructure/validation-error.ts';
import { handleApiError } from './handle-api-error.ts';

function fakeRes() {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });

  return { res: { status } as unknown as Response, status, json };
}

describe('handleApiError', () => {
  it('maps ResourceNotFound to 404 with the not_found code', () => {
    const { res, status, json } = fakeRes();

    handleApiError(new ResourceNotFound('nope'), res);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({
      success: false,
      data: { code: ApiErrorCode.NotFound },
    });
  });

  it('maps ValidationError to 400 with the validation_failed code', () => {
    const { res, status, json } = fakeRes();

    handleApiError(new ValidationError('bad'), res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      success: false,
      data: { code: ApiErrorCode.ValidationFailed },
    });
  });

  it('maps any other error to 500 without data', () => {
    const { res, status, json } = fakeRes();

    handleApiError(new Error('boom'), res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ success: false, data: undefined });
  });
});
