import { describe, expect, it } from 'vitest';
import { CheckoutInfoBuilder } from '@testdata/CheckoutInfoBuilder';

describe('CheckoutInfoBuilder', () => {
  it('builds fully-populated checkout info from faker defaults, with no overrides', () => {
    const info = new CheckoutInfoBuilder().build();

    expect(info.firstName.length).toBeGreaterThan(0);
    expect(info.lastName.length).toBeGreaterThan(0);
    expect(info.postalCode.length).toBeGreaterThan(0);
  });

  it('lets individual fields be overridden while the rest stay fake-generated', () => {
    const info = new CheckoutInfoBuilder().withFirstName('Jane').withLastName('Doe').build();

    expect(info).toMatchObject({ firstName: 'Jane', lastName: 'Doe' });
    expect(info.postalCode.length).toBeGreaterThan(0);
  });

  it('is chainable and returns a fresh, independent object per build()', () => {
    const builder = new CheckoutInfoBuilder().withPostalCode('12345');

    expect(builder.build()).toEqual(builder.build());
    expect(builder.build()).not.toBe(builder.build());
  });
});
