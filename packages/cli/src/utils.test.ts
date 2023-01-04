import {
  flattenObject,
  deflattenObject,
  getParams,
  getFilesFromFolder,
} from './utils';
import path from 'node:path';

describe('test helper functions', () => {
  test('should flatten the object', () => {
    const res = flattenObject({ foo: { bar: 'baz', qux: 'quux' } });

    expect(res).toStrictEqual({ 'foo.bar': 'baz', 'foo.qux': 'quux' });
  });

  test('should deflatten the object', () => {
    const res = deflattenObject({ 'foo.bar': 'baz', 'foo.qux': 'quux' });

    expect(res).toStrictEqual({ foo: { bar: 'baz', qux: 'quux' } });
  });

  test('should get a param', () => {
    const res = getParams('test this {{ param }}');

    expect(res).toStrictEqual(['param']);
  });

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
