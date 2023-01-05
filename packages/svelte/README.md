# t9n Lib

> A custom internationalization (i18n) solution for the "Türko-IP Großprojekte Wizard".

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

_../locale/de.json: The actual language file_

```json
{
  "pageOne": {
    "headline": "Das ist die Überschrift von einem echten Übersetzer. Echt. 👩‍🏫👨‍🏫"
  }
}
```

Now _de.json_ can be referenced within a config file to initialize a t9n instance:

_./locale.ts_

```typescript
import de from '../locale/de.json';
import meta from '../locale/meta.json';

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
const fallbackLanguage = languages[0];

// logging functions
const logFallback = (translationKey: string, currentLanguage: string) =>
  logWarn(
    `[i18n] The translationKey «${translationKey}» is missing within «${currentLanguage}». Using the fallback language: «${fallbackLanguage.locale}».`,
  );

const logMissing = (translationKey: string, currentLanguage: string) =>
  logWarn(
    `[i18n] The translationKey «${translationKey}» is missing within «${currentLanguage}». Neither does the fallback language.`,
  );

const t9n = newT9n<TranslationArgs>()({
  languages,
  fallbackLanguage,
  logFallback,
  logMissing,
});

// export all properties/stores/functions that are used by the application
export const locale = t9n.locale;
export const t = t9n.t;
export const $t = t9n.$t;
export const ti = t9n.ti;
export const $ti = t9n.$ti;
export const getLocaleDateString = t9n.getLocaleDateString;
export const getLocaleTimeString = t9n.getLocaleTimeString;
export const getLocaleStringFromNumber = t9n.getLocaleStringFromNumber;
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

As soon as these steps are done, you can start with the actual translation.

## Usage

To finally get translation by keys, you can use `t` or `ti` Svelte Store within Svelte files:

```typescript
import { t, ti } from '../locale';

// Returns the translated string
$t(['pageOne.headline']);

// Returns an object with the hit information and the actual text
$ti(['pageOne.headline']);
```

If you like you can turn these command into a Svelte component and print styles based on the hit information. See [Create a T component](##Create-a-T-component) for more.

Outside a Svelte file you should use the exported helpers:

```typescript
import { $t, $ti } from '../locale';

// Returns the translated string
$t(['pageOne.headline']);

// Returns an object with the hit information and the actual text
$ti(['pageOne.headline']);
```

To translate dates, times or numbers use the following functions:

```typescript
getLocaleDateString(new Date()),
getLocaleTimeString(new Date()),
getLocaleStringFromNumber(1.2),
```

Those functions are derived from `Date.prototype.toLocal...` functions: [MDN Web Docs](https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString).

### Set the language

To set the language use the `locale` method. If you want to detect the language automatically use the following code:

```typescript
//For example within your App.svelte

t9n.locale.trySet(navigator.language);
```

### Create a T component

```typescript
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

**Usage**

```html
<T args={['pageOne.headline']}>
  <!-- //injects a <span /> and some styles depending on the build mode and dictionary hit --></T
>
```

If the translation includes parameter that should be interpolated use the params prop:

```html
<T args={['pageOne.headline', {params:{entranceNumber: 1}}]}>
  <!-- //injects a <span /> and some styles depending on the build mode and dictionary hit --></T
>
```
