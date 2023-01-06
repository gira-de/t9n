# Svelte Typesafe Internationalization

> A tiny Node.js based CLI that provides some tools to improve all things around i18n and a Svelte Store to enable typesafe internationalization.

## What is this for?

This lib is designed to support developers as well as translators and make their life easier. It:

- 📖 Makes translation keys type safe.
- 🚨 Shows developers and other stakeholders if translations are missing.
- 👜 Makes it easy to create a list of all used translation keys and extract something translation agencies can work with (xlsx ftw 👍).
- 🛬 Allows seamless imports of new translations.

### The Workflow

Everything in this lib is built around the following workflow. Sure, use it however you like, but this was in our mind when we created it.

1. Install this package ➡️ [Installation](##Installation)
2. Put all translation keys in the file (_meta.json_) and run `t9n typedefs <filename>` whenever it changes ➡️ [CLI Docs](/docs/cli.md)
3. Once the translations is created, run `t9n export <folderpath>` to create a xlsx-sheet for all translation keys. ➡️ [CLI Docs](/docs/cli.md)
4. Once the translation is done, import the translated xlsx with `t9n import <filename>` to create json files for every defined language. ➡️ [CLI Docs](/docs/cli.md)
5. To use these new translations adjust your config, if neccessary. ➡️ [Store Docs](/docs/store.md)

## Contributing

Contributions are always welcome!
