import { findPropByString, renderString } from './utils';
import { writable, derived } from 'svelte/store';
import type { Readable } from 'svelte/store';

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export type TranslationHit =
  | 'none'
  | 'fallbackDictionary'
  | 'currentDictionary';

export type TranslationInfo = Readonly<{
  text: string;
  hit: TranslationHit;
}>;

export type Language<TDict, TLocale> = Readonly<{
  locale: TLocale;
  name: string;
  dictionary: TDict;
}>;

export type TranslationConfig<TDict, TLocale> = Readonly<{
  languages: ReadonlyArray<Language<DeepPartial<TDict>, TLocale>>;
  translationFallback: Language<TDict, TLocale>;
  logFallback: (translationKey: string, currentLanguage: string) => void;
  logMissing: (translationKey: string, currentLanguage: string) => void;
}>;

/**
 * WORKAROUND: use currying as a workaround for https://github.com/microsoft/TypeScript/issues/16597
 * @returns
 */
export default function t9n<
  TArgs extends [key: string, options?: { params: Record<string, unknown> }],
>() {
  return function <
    TDict extends Record<string, unknown>,
    TLocale extends string,
  >(config: TranslationConfig<TDict, TLocale>) {
    // Locales
    const locals: string[] = config.languages.map((t) => t.locale);

    // current language
    let language: Language<
      DeepPartial<TDict>,
      TLocale
    > = config.translationFallback;

    const isLocale = (locale: string): locale is TLocale =>
      locals.includes(locale);

    // Locale
    const _locale = writable<TLocale>(language.locale);
    const locale = {
      ..._locale,
      set: ($newLocale: TLocale) => {
        language =
          config.languages.find((l) => l.locale === $newLocale) ??
          config.translationFallback;
        _locale.set(language.locale);
      },
      trySet: (unsafeLocale: string, fallbackLanguage: TLocale) => {
        // try set exact match
        if (isLocale(unsafeLocale)) {
          locale.set(unsafeLocale);
          return;
        }

        // try set base language, e.g. de-DE -> de
        const unsafeBaseLocale = unsafeLocale.split('-')[0];
        if (isLocale(unsafeBaseLocale)) {
          locale.set(unsafeBaseLocale);
          return;
        }

        // try set sub language, de -> de-DE
        const subLocale = locals.find((locale) =>
          locale.startsWith(unsafeBaseLocale + '-'),
        );
        if (subLocale && isLocale(subLocale)) {
          locale.set(subLocale);
          return;
        }

        // set fallback language
        locale.set(fallbackLanguage);
      },
    };

    /**
     * Returns a translation for a given translationKey. Use within a svelte component.
     *
     * @example
     * ```typescript
     * const tr = getTranslation('pageOne.headline') // 'Hello World!'
     * const tr = getTranslation('pageOne.description', {params: {one: foo}}) // 'This is foo'
     * ```
     *
     * @param args
     *    args[0] - A string dot-notation of the loaded language.json file. For example pageOne.headline.
     *    args[1] - An object with the keys: params: Record<string, string> -> The parameters that get integrated into the actual translation.
     *
     * @returns {string} - The translation
     */
    const ti: Readable<typeof $ti> = derived([locale], () => $ti);

    /**
     * Returns a translation for a given translationKey. Use outside a svelte component.
     *
     * @example
     * ```typescript
     * const tr = getTranslation('pageOne.headline') // 'Hello World!'
     * const tr = getTranslation('pageOne.description', {params: {one: foo}}) // 'This is foo'
     * ```
     *
     * @param args
     *    args[0] - A string dot-notation of the loaded language.json file. For example pageOne.headline.
     *    args[1] - An object with the keys: params: Record<string, string> -> The parameters that get integrated into the actual translation.
     *
     * @returns {string} - The translation
     */
    const $ti = getTranslationInfo;
    function getTranslationInfo(...args: TArgs): TranslationInfo {
      const translationKey = args[0];
      const { params } = args[1] || { params: {} };

      const translation = findPropByString(language.dictionary, translationKey);

      if (!translation) {
        const translationFallback = findPropByString(
          config.translationFallback.dictionary,
          translationKey,
        );

        if (!translationFallback) {
          config.logMissing(translationKey, language.locale);
          return {
            hit: 'none',
            text: translationKey,
          };
        } else {
          config.logFallback(translationKey, language.locale);
          return {
            hit: 'fallbackDictionary',
            text: renderString(translationFallback, params),
          };
        }
      } else {
        return {
          hit: 'currentDictionary',
          text: renderString(translation, params),
        };
      }
    }

    /**
     * Returns the translation (result.text) with additional information's (result.hit)
     *
     * @example
     * ```typescript
     * const tr = getTranslation('pageOne.headline') // 'Hello World!'
     * const tr = getTranslation('pageOne.description', {params: {one: foo}}) // 'This is foo'
     * ```
     *
     * @param args
     *    args[0] - A string dot-notation of the loaded language.json file. For example pageOne.headline.
     *    args[1] - An object with the keys: params: Record<string, string> -> The parameters that get integrated into the actual translation.
     *
     * @returns An object containing the the translation (text) and hit information (hit)
     */
    const t: Readable<typeof $t> = derived([locale], () => $t);

    /**
     * Returns the translation (result.text) with additional information's (result.hit)
     *
     * @example
     * ```typescript
     * const tr = getTranslation('pageOne.headline') // 'Hello World!'
     * const tr = getTranslation('pageOne.description', {params: {one: foo}}) // 'This is foo'
     * ```
     *
     * @param args
     *    args[0] - A string dot-notation of the loaded language.json file. For example pageOne.headline.
     *    args[1] - An object with the keys: params: Record<string, string> -> The parameters that get integrated into the actual translation.
     *
     * @returns An object containing the the translation (text) and hit information (hit)
     */
    const $t = getTranslation;
    function getTranslation(...args: TArgs): string {
      return getTranslationInfo(...args).text;
    }

    // Additional locale date and time helpers

    function getLocaleDateString(
      date: Date,
      options: Intl.DateTimeFormatOptions,
    ) {
      try {
        return date.toLocaleDateString(language.locale, options);
      } catch (error) {
        return date.toLocaleDateString('de', options);
      }
    }

    function getLocaleTimeString(
      date: Date,
      options: Intl.DateTimeFormatOptions,
    ) {
      try {
        return date.toLocaleTimeString(language.locale, options);
      } catch (error) {
        return date.toLocaleTimeString('de', options);
      }
    }

    function getLocaleStringFromNumber(
      num: number,
      options: Intl.DateTimeFormatOptions,
    ) {
      try {
        return num.toLocaleString(language.locale, options);
      } catch (error) {
        return num.toLocaleString('de', options);
      }
    }

    return {
      locale,

      /**
       * Returns the translation for a given translation key. Use within a svelte component.
       *
       * @example
       * ```typescript
       * const tr = $t(['pageOne.headline']) // 'Hello World!'
       * const tr = $t(['pageOne.description', {one: foo}]) // 'This is foo'
       * ```
       *
       * @param args
       *    args[0] - A string dot-notation of the loaded language.json file. For example pageOne.headline.
       *    args[1] - An parameters object Record<string, string> -> The parameters that get integrated into the actual translation.
       *
       * @returns A string, the acutal translation
       */
      t,
      /**
       * Returns the translation for a given translation key. Use within a svelte component.
       *
       * @example
       * ```typescript
       * const tr = $t(['pageOne.headline']) // 'Hello World!'
       * const tr = $t(['pageOne.description', {one: foo}]) // 'This is foo'
       * ```
       *
       * @param args
       *    args[0] - A string dot-notation of the loaded language.json file. For example pageOne.headline.
       *    args[1] - An parameters object Record<string, string> -> The parameters that get integrated into the actual translation.
       *
       * @returns A string, the acutal translation
       */
      $t,

      /**
       * Returns the translation (result.text) with additional information's (result.hit).. Use within a svelte component.
       *
       * @example
       * ```typescript
       * const tr = $ti(['pageOne.headline']) // 'Hello World!'
       * const tr = $ti(['pageOne.description', {one: foo}]) // 'This is foo'
       * ```
       *
       * @param args
       *    args[0] - A string dot-notation of the loaded language.json file. For example pageOne.headline.
       *    args[1] - An parameters object Record<string, string> -> The parameters that get integrated into the actual translation.
       *
       * @returns An object containing the the translation (text) and hit information (hit)
       */
      ti,

      /**
       * Returns the translation (result.text) with additional information's (result.hit). Use outside a svelte component.
       *
       * @example
       * ```typescript
       * const tr = $ti(['pageOne.headline']) // 'Hello World!'
       * const tr = $ti(['pageOne.description', {one: foo}]) // 'This is foo'
       * ```
       *
       * @param args
       *    args[0] - A string dot-notation of the loaded language.json file. For example pageOne.headline.
       *    args[1] - An parameters object Record<string, string> -> The parameters that get integrated into the actual translation.
       *
       * @returns An object containing the the translation (text) and hit information (hit)
       */
      $ti,
      getLocaleDateString,
      getLocaleTimeString,
      getLocaleStringFromNumber,
    };
  };
}
