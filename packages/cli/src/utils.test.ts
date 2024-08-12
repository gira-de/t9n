import {
  flattenObject,
  deflattenObject,
  getParams,
  getFilesFromFolder,
} from './utils';
import path from 'node:path';

describe('flattenObject', () => {
  test('should flatten the object', () => {
    const res = flattenObject({ foo: { bar: 'baz', qux: 'quux' } });

    expect(res).toStrictEqual({ 'foo.bar': 'baz', 'foo.qux': 'quux' });
  });
});

describe('deflattenObject', () => {
  test('should deflatten the object', () => {
    const res = deflattenObject({ 'foo.bar': 'baz', 'foo.qux': 'quux' });

    expect(res).toStrictEqual({ foo: { bar: 'baz', qux: 'quux' } });
  });

  test('handles numeric keys like strings', () => {
    const res = deflattenObject({
      'units.2': 'Two',
      'units.3': 'Three',
      'units.5': 'Five',
    });

    expect(res).toStrictEqual({
      units: {
        2: 'Two',
        3: 'Three',
        5: 'Five',
      },
    });
  });

  test('throws an exception when a value is also used as an object', () => {
    expect(() => {
      deflattenObject({
        units: 'Units',
        'units.1': 'One',
        'units.5': 'Five',
      });
    }).toThrow();
  });

  test('ignores double dots', () => {
    const res = deflattenObject({ 'foo..bar': 'baz', 'foo...qux': 'quux' });

    expect(res).toStrictEqual({ foo: { bar: 'baz', qux: 'quux' } });
  });

  test('ignores whitespace at start and end of translation key paths', () => {
    const res = deflattenObject({
      ' foo   .\tbar\r\n': 'baz',
      'foo...qux': 'quux',
    });

    expect(res).toStrictEqual({ foo: { bar: 'baz', qux: 'quux' } });
  });
});

describe('getParams', () => {
  test('should get a param', () => {
    const res = getParams('test this {{ param }}');

    expect(res).toStrictEqual(['param']);
  });
});

describe('getFilesFromFolder', () => {
  test('Find a meta.json in the provided folder', () => {
    const inputPath = path.join(process.cwd(), `tests/fixtures`);

    const res = getFilesFromFolder(inputPath);

    expect(res).toBeTruthy();
  });

  test('should throw an error if there is no meta.json in the provided folder', () => {
    const inputPath = path.join(process.cwd(), `tests`);

    expect.assertions(1);

    try {
      getFilesFromFolder(inputPath);
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });
});
