import { faker } from '@faker-js/faker';
import type { CheckoutInfo } from '@entities/CheckoutInfo';

/**
 * Builder pattern for checkout form data. Starts pre-filled with realistic fake data (via
 * `@faker-js/faker`) so a test only has to override the field(s) it actually cares about,
 * instead of hand-writing every field every time.
 */
export class CheckoutInfoBuilder {
  private firstName = faker.person.firstName();
  private lastName = faker.person.lastName();
  private postalCode = faker.location.zipCode();

  withFirstName(firstName: string): this {
    this.firstName = firstName;
    return this;
  }

  withLastName(lastName: string): this {
    this.lastName = lastName;
    return this;
  }

  withPostalCode(postalCode: string): this {
    this.postalCode = postalCode;
    return this;
  }

  build(): CheckoutInfo {
    return { firstName: this.firstName, lastName: this.lastName, postalCode: this.postalCode };
  }
}
