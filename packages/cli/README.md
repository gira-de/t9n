# t9n CLI

## Commands

### typedefs

This command will generate a Typescript declaration file (\*.ts) based on the provided json file.

```shell
t9n typedefs <filename>
```

**Flags**

```
-o, --output <filename>     Filename/-path for the declaration file

```

### export

This command creates a xlsx translation file based on a meta.json within a given folder. If there are additional languages files (for example de.json, en.json) within this folder, the command will put this into the resulting xlsx too.

This command currently needs some config:

```json
// t9n.config.json
{
  "version": "0.0.1",
  "worksheetName": "Translation",
  "languages": ["meta", "de"]
};
```

```shell
t9n export <folderpath>
```

**Flags**

```
-o, --output <folderpath> Folderpath for the resulting xlsx
```

### import

Import a translation.xlsx and create <language>.json file out of it (like de.json, en.json,...).

```shell
t9n import <excel-input> [--output <folderpath>]
```

**Flags**

```
-o, --output <folderpath> Folderpath for the resulting <language>.json.
```

### check

This command checks all <language>.json compared to a meta.json reference within a given folder. The result will be printed to stdout.

```shell
t9n check <input>
```

Prints a table like this to stdout:

| (index) | \_\_filename | translationKeys | missingTranslationKeys | coverage | missingParams  |
| ------- | ------------ | --------------- | ---------------------- | -------- | -------------- |
| 0       | 'de'         | 3               | 1                      | 0.67     | []             |
| 1       | 'en'         | 3               | 2                      | 0.33     | ['missingKey'] |
