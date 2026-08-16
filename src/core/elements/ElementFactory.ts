import type { Page } from '@playwright/test';
import type { ElementDescriptor } from './Element';
import type { LocatorHealer } from '@core/healing/LocatorHealer';
import { Button } from './Button';
import { Input } from './Input';
import { Dropdown } from './Dropdown';
import { Checkbox } from './Checkbox';
import { Link } from './Link';
import { Text } from './Text';

/**
 * Builds typed elements bound to a single `page` (and, optionally, a shared `healer`). Page
 * objects depend on this factory instead of calling `new Button(...)` directly, so swapping the
 * healer implementation (mock vs. agent-backed) never touches page-object code.
 */
export class ElementFactory {
  constructor(
    private readonly page: Page,
    private readonly healer?: LocatorHealer,
  ) {}

  button(descriptor: ElementDescriptor): Button {
    return new Button(this.page, descriptor, this.healer);
  }

  input(descriptor: ElementDescriptor): Input {
    return new Input(this.page, descriptor, this.healer);
  }

  dropdown(descriptor: ElementDescriptor): Dropdown {
    return new Dropdown(this.page, descriptor, this.healer);
  }

  checkbox(descriptor: ElementDescriptor): Checkbox {
    return new Checkbox(this.page, descriptor, this.healer);
  }

  link(descriptor: ElementDescriptor): Link {
    return new Link(this.page, descriptor, this.healer);
  }

  text(descriptor: ElementDescriptor): Text {
    return new Text(this.page, descriptor, this.healer);
  }
}
