# @gira-de/t9n-svelte

## 2.0.2

### Patch Changes

- 64ca4d8: Updating dependencies

## 2.0.1

### Patch Changes

- 7679835: Add UMD support
- 6b132e6: Add installation script

## 2.0.0

### Major Changes

- `trySet` now sets a fallback language if the given default locale is not available. The fallback language is the second parameter of `trySet`.

  ```typescript
   trySet: (unsafeLocale: string, fallbackLanguage: TLocale) => {
          // ...

          // set fallback language
          locale.set(fallbackLanguage);
        },
  ```

  Aside from that the _fallbackLanguage_ is now renamed to **translationFallback** to be more specific.

## 1.0.0

### Major Changes

- 8b5087f: ## 1.0.0 🥳

  This lib is designed to support developers as well as translators and make their life easier. It:

  - 📖 Makes translation keys type safe.
  - 🚨 Shows developers and other stakeholders if translations are missing.
  - 👜 Makes it easy to create a list of all used translation keys and extract something translation agencies can work with (xlsx ftw 👍).
  - 🛬 Allows seamless imports of new translations.

## 0.0.2

### Patch Changes

- c2aa3c4: Rename default function to t9n (instead of newT9n)
