# t9n Lib

> A Svelte translation (t9n) solution for @gira-de/t9n.

See a working example here: [t9n@Stackblitz](https://stackblitz.com/github/gira-de/t9n/tree/dev/examples/svelte-t9n).

## Installation

```bash
npm install @gira-de/t9n-svelte
```

## Initialization

To get started, the following files are required:

_./locale/meta.json: This json describes the structure of the actual language files. Every possible translation key needs to be described here._

```json
{
  "pageOne": {
    "headline": "This is a fancy headline written by a developer. Don't trust this! 🦹‍♀️🦹‍♂️"
  }
}
```

_./locale/de.json: The actual language file_

```json
{
  "pageOne": {
    "headline": "Das ist die Überschrift von einem echten Übersetzer. Echt. 👩‍🏫👨‍🏫"
  }
}
```

Now _de.json_ can be referenced during initialization of the t9n library:

\_./src/App.svelte

```svelte
<script lang="ts">
  import de from '../locale/de.json';
  import meta from '../locale/meta.json';
  import type { TranslationArgs } from '../locale/types';
  import t9n from '@gira-de/t9n-svelte';

  // dictionary with all languages
  const languages = [
    {
      locale: 'meta',
      name: 'Developer',
      dictionary: meta,
    },
    {
      locale: 'de',
      name: 'German',
      dictionary: de,
    },
    {
      locale: 'en',
      name: 'English',
      dictionary: {},
    },
  ] as const;

  // default language
  const translationFallback= languages[0];

  // logging functions
  const logFallback = (translationKey: string, currentLanguage: string) =>
    console.warn(
      `[t9n] The translationKey «${translationKey}» is missing within «${currentLanguage}». Using the translation fallback: «${translationFallback.locale}».`,
    );

  const logMissing = (translationKey: string, currentLanguage: string) =>
    console.warn(
      `[t9n] The translationKey «${translationKey}» is missing within «${currentLanguage}». Neither does the fallback language.`,
    );

  // locale, t and ti are Svelte Stores. Use the locale Store to change the language and t/ti to get the translation.
  const { locale, t, ti } = t9n<TranslationArgs>()({
    languages,
    translationFallback,
    logFallback,
    logMissing,
  });

  let selected: 'meta' | 'de' | 'en';
</script>
```

## Usage

### Get translations

To finally get translation by keys, you can use `t` or `ti` Svelte Stores:

```typescript
const { locale, t, ti } = t9n<TranslationArgs>()({
  languages,
  translationFallback,
  logFallback,
  logMissing,
});

// Returns the translated string
$t(['pageOne.headline']);

// Returns an object with the hit information and the actual text
$ti(['pageOne.headline']);
```

If you like you can turn these command into a Svelte component and print styles based on the hit information. See [Create a T component](##Create-a-T-component) for more.

### Translate numbers and dates

```typescript
getLocaleDateString(new Date()),
getLocaleTimeString(new Date()),
getLocaleStringFromNumber(1.2),
```

Those functions are derived from `Date.prototype.toLocal...` functions: [MDN Web Docs](https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString).

### Set the language

To set the language use the `locale` method. If you want to detect the language automatically use the following code:

```typescript
const { locale } = t9n<TranslationArgs>()({...});

// Tries to set the language according to the current browser settings.
// If the current browser language is not supported by the list of translations available,
// use one of the defined languages as fallback (in this case 'en').:
locale.trySet(navigator.language, 'en');
```

### Create a T component

If you like you can turn the `t` and `ti` Svelte Stores into a Svelte component and print styles based on the hit information.

```svelte
<script lang="ts">
  import { t, ti } from './locale';
  import type { TranslationArgs } from './locale-types';

  export let args: TranslationArgs;
</script>

{#if process.env.MODE === 'development'}
  {@const transInfo = $ti(...args)}
  <span
    class:isFallback={translationInfo.hit === 'fallbackDictionary'}
    class:isNone={translationInfo.hit === 'none'}>{translationInfo.text}</span
  >
{:else}
  <span>{$t(...args)}</span>
{/if}

<style>
  .isNone {
    text-decoration-line: underline;
    text-decoration-style: wavy;
    text-decoration-color: rgb(252, 69, 37);
  }

  .isFallback {
    text-decoration-line: underline;
    text-decoration-style: wavy;
    text-decoration-color: rgb(110, 167, 214);
  }
</style>
```

## RFC 5646

As described in [RFC 5646: Tags for Identifying Languages (also known as BCP 47)](https://datatracker.ietf.org/doc/html/rfc5646) language tags with subtags are allow. For example:

```typescript
const languages = [
  //...
  {
    locale: 'en',
    name: 'English',
    dictionary: en,
  },
  {
    locale: 'en-US',
    name: 'English (US)',
    dictionary: enUS,
  },
] as const;
```
