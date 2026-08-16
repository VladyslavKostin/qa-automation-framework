import { describe, expect, it } from 'vitest';
import { assertHasNonEmptyFields } from '@core/api/schema';

describe('assertHasNonEmptyFields', () => {
  it('does not throw when every required key is present and non-empty', () => {
    expect(() =>
      assertHasNonEmptyFields({ id: 1, name: 'Ervin Howell', email: 'x@y.test' }, ['id', 'name', 'email']),
    ).not.toThrow();
  });

  it.each([
    ['null', { id: 1, name: null }],
    ['undefined', { id: 1, name: undefined }],
    ['empty string', { id: 1, name: '' }],
  ])('throws when a required key is %s', (_label, value) => {
    expect(() => assertHasNonEmptyFields(value, ['id', 'name'])).toThrow(/name/);
  });
});
