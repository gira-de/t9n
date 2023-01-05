import { newT9n } from '.';
import { noop } from 'svelte/internal';
import { get } from 'svelte/store';

const fallbackDictionary = {
  test: {
    onlyInFallback: 'onlyInFallback',
  },
  meta: {
    buttons: {
      next: 'Next',
      back: 'Back',
    },
  },
};

const fallbackLanguage = {
  locale: 'meta',
  name: 'Fallback',
  dictionary: fallbackDictionary,
} as const;

const languages = [
  fallbackLanguage,
  {
    locale: 'de',
    name: 'German',
    dictionary: {},
  },
  {
    locale: 'de-DE',
    name: 'German (Germany)',
    dictionary: {},
  },
  {
    locale: 'en',
    name: 'English',
    dictionary: {},
  },
  {
    locale: 'es-AR',
    name: 'Spain (Argentina)',
    dictionary: {},
  },
  {
    locale: 'fi-FI-123',
    name: 'Spain (Argentina)',
    dictionary: {},
  },
] as const;

type TranslationArgs =
  | ['test.onlyInFallback']
  | ['meta.buttons.next']
  | ['meta.buttons.back'];

const {
  locale,
  getLocaleDateString,
  getLocaleTimeString,
  getLocaleStringFromNumber,
  $t,
  $ti,
} = newT9n<TranslationArgs>()({
  languages,
  fallbackLanguage,
  logFallback: noop,
  logMissing: noop,
});

describe('testing locale', () => {
  test('should have a default language', () => {
    expect(get(locale)).toEqual('meta');
  });

  test('should set the language', () => {
    locale.set('en');
    expect(get(locale)).toEqual('en');

    locale.set('de');
    expect(get(locale)).toEqual('de');
  });

  test('invalid locale id', () => {
    // @ts-expect-error expect error due to an invalid locale id
    locale.set('asdf');
    expect(get(locale)).toEqual(fallbackLanguage.locale);
  });
});

describe('trySet', () => {
  test('set locale: exact match', () => {
    locale.trySet('en');
    expect(get(locale)).toEqual('en');

    locale.trySet('de');
    expect(get(locale)).toEqual('de');

    locale.trySet('de-DE');
    expect(get(locale)).toEqual('de-DE');
  });

  test('set locale: base match', () => {
    locale.trySet('en-US');
    expect(get(locale)).toEqual('en');

    locale.trySet('de-DE-123');
    expect(get(locale)).toEqual('de');
  });

  test('set locale: sub match', () => {
    locale.trySet('es');
    expect(get(locale)).toEqual('es-AR');

    locale.trySet('fi');
    expect(get(locale)).toEqual('fi-FI-123');
  });

  test('set locale fail: set fallback', () => {
    locale.trySet('');
    expect(get(locale)).toEqual(fallbackLanguage.locale);

    locale.trySet('zz');
    expect(get(locale)).toEqual(fallbackLanguage.locale);

    locale.trySet('zz-US');
    expect(get(locale)).toEqual(fallbackLanguage.locale);
  });
});

describe('testing dictionary with showHit: undefined', () => {
  test('should have a dictionary', () => {
    locale.set('meta');
    expect(get(locale)).toEqual(fallbackLanguage.locale);
  });

  test('should return a translation for a key', () => {
    expect($t('meta.buttons.next')).toBe('Next');
  });

  test('should return a fallback translation for a key that is missing in the current locale', () => {
    locale.set('de');

    expect($t('test.onlyInFallback')).toBe('onlyInFallback');
  });

  test('should return the translation key for a key that is missing in the current locale and in the fallback', () => {
    const missingTranslationKey = 'dp-sw.rocks';

    // @ts-expect-error ignore typings to test implementation
    expect($t(missingTranslationKey)).toBe(missingTranslationKey);
  });
});

describe('testing dictionary with showHit: true', () => {
  beforeAll(() => {
    locale.set('meta');
  });

  test('should return a translation for a key', () => {
    expect($ti('meta.buttons.next')).toStrictEqual({
      hit: 'currentDictionary',
      text: 'Next',
    });
  });

  test('should return a fallback translation for a key that is missing in the current locale', () => {
    locale.set('de');

    expect($ti('test.onlyInFallback')).toStrictEqual({
      hit: 'fallbackDictionary',
      text: 'onlyInFallback',
    });
  });

  test('should return the translation key for a key that is missing in the current locale and in the fallback', () => {
    const missingTranslationKey = 'dp-sw.rocks';

    expect(
      // @ts-expect-error ignore typings to test implementation
      $ti(missingTranslationKey),
    ).toStrictEqual({
      hit: 'none',
      text: missingTranslationKey,
    });
  });
});

describe('testing getLocaleDateString', () => {
  const testDate = new Date(Date.UTC(2022, 11, 20, 3, 0, 0));

  test('should return a date string for locale en', () => {
    locale.set('en');
    const localeDate = getLocaleDateString(testDate, {});

    expect(localeDate).toBe('12/20/2022');
  });

  test('should return a date string for locale that does not exist (using fallback de)', () => {
    locale.set('meta');
    const localeDate = getLocaleDateString(testDate, {});

    expect(localeDate).toBe('20.12.2022');
  });
});

describe('testing getLocaleTimeString', () => {
  const testTime = new Date('February 7, 2022 19:15:30 GMT+00:00');

  test('should return a time string for locale en', () => {
    locale.set('en');
    const localeTime = getLocaleTimeString(testTime, { timeZone: 'UTC' });

    expect(localeTime).toBe('7:15:30 PM');
  });

  test('should return a time string for locale that does not exist (using fallback de)', () => {
    locale.set('meta');
    const localeTime = getLocaleTimeString(testTime, { timeZone: 'UTC' });

    expect(localeTime).toBe('19:15:30');
  });
});

describe('testing getLocaleStringFromNumber', () => {
  const testNumber = 1.2;

  test('should return a number string for locale en', () => {
    locale.set('en');
    const localeNumber = getLocaleStringFromNumber(testNumber, {});

    expect(localeNumber).toBe('1.2');
  });

  test('should return a number string for locale that does not exist (using fallback de)', () => {
    locale.set('meta');
    const localeNumber = getLocaleStringFromNumber(testNumber, {});

    expect(localeNumber).toBe('1,2');
  });
});
