# @gira-de/t9n-cli

## 1.1.0

### Minor Changes

- Feature for import command: Sort imported files alphabetically to create a stable, diff-able output

Fixes:

- Mitigate security vulnerability in various dependencies by updating to newer versions
- Fixes error "cannot save file" that can happen in some environments
- Fixes error that "t9n import" will create fields with "null" values when cells are empty excel sheet

## 1.0.2

### Patch Changes

- 4395add: Fix import when translation for some keys are missing

## 1.0.1

### Patch Changes

- 64ca4d8: Updating dependencies

## 1.0.0

### Major Changes

- 8b5087f: ## 1.0.0 🥳

  This lib is designed to support developers as well as translators and make their life easier. It:

  - 📖 Makes translation keys type safe.
  - 🚨 Shows developers and other stakeholders if translations are missing.
  - 👜 Makes it easy to create a list of all used translation keys and extract something translation agencies can work with (xlsx ftw 👍).
  - 🛬 Allows seamless imports of new translations.

## 0.0.3

### Patch Changes

- 1634f9e: Fix typos
- 1c42712: Overall readme improvements

## 0.0.2

### Patch Changes

- 98f0d3e: Changeset init
- Overall improved readme
