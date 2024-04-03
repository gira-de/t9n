import { findPropByString, renderString } from './utils';
import { describe, test, expect } from 'vitest';

describe('testing parameters', () => {
  test('should return with one param (with spaces: {{ param  }})', () => {
    expect(
      renderString('Türstation {{ entranceNumber  }}', { entranceNumber: '1' }),
    ).toBe('Türstation 1');
  });

  test('should return with one param (without spaces: {{param}})', () => {
    expect(
      renderString('Mieteinheit {{apartmentNumber}}', { apartmentNumber: 1 }),
    ).toBe('Mieteinheit 1');
  });

  test('should return with multiple params', () => {
    expect(
      renderString('value1 == {{ param1 }} and value2 == {{ param2 }}', {
        param1: 'value1',
        param2: 'value2',
      }),
    ).toBe('value1 == value1 and value2 == value2');
  });
});

describe('find property by string', () => {
  const meta = { a: { b: { c: 'c-leaf' } } };

  test('property found', () => {
    expect(findPropByString(meta, 'a.b.c')).toBe('c-leaf');
  });

  test('property not found', () => {
    expect(findPropByString(meta, 'a.b.c.d')).toBeFalsy();
  });

  test('property not leaf', () => {
    expect(findPropByString(meta, 'a.b')).toBeFalsy();
  });
});
