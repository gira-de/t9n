import { check, validateLanguageJson } from './check';
import path from 'node:path';

describe('Test check', () => {
  const inputPath = path.join(process.cwd(), '/tests/fixtures');

  test('should successfully check all files within the input folder', () => {
    const res = check(inputPath);

    expect(res).toEqual([
      {
        __filename: 'de',
        translationKeys: 3,
        missingTranslationKeys: 1,
        coverage: 0.67,
        missingParams: [],
      },
      {
        __filename: 'en',
        translationKeys: 3,
        missingTranslationKeys: 2,
        coverage: 0.33,
        missingParams: [],
      },
    ]);
  });

  test('should compare the translation keys successfully', () => {
    const res = validateLanguageJson({
      reference: { keyOne: 'foo', keyTwo: 'bar' },
      data: { __filename: 'test', keyOne: 'foo', keyTwo: 'bar' },
    });

    expect(res).toStrictEqual({
      __filename: 'test',
      translationKeys: 2,
      missingTranslationKeys: 0,
      coverage: 1,
      missingParams: [],
    });
  });

  test('should calculate the coverage', () => {
    const res = validateLanguageJson({
      reference: { keyOne: 'foo', keyTwo: 'bar', keyThree: 'baz' },
      data: { __filename: 'test', keyOne: 'foo' },
    });

    expect(res).toStrictEqual({
      __filename: 'test',
      translationKeys: 3,
      missingTranslationKeys: 2,
      coverage: 0.33,
      missingParams: [],
    });
  });

  test('should cound missing parameters', () => {
    const res = validateLanguageJson({
      reference: { keyOne: 'foo {{param}}', keyTwo: 'bar', keyThree: 'baz' },
      data: { __filename: 'test', keyOne: 'foo' },
    });

    expect(res).toStrictEqual({
      __filename: 'test',
      translationKeys: 3,
      missingTranslationKeys: 2,
      coverage: 0.33,
      missingParams: ['keyOne'],
    });
  });
});
