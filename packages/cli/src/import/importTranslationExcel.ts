import { deflattenObject } from './../utils';
import Conf from 'conf';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import prettier from 'prettier';
import { read, utils } from 'xlsx';

/**
 * Config handling
 */

const config = new Conf({
  schema: {
    version: {
      type: 'string',
    },
    worksheetName: {
      type: 'string',
    },
    languages: {
      type: 'array',
    },
  },
  cwd: '.',
  configName: 't9n.config',
});

/**
 *
 * @param inputPath A string representing the inputPath where the translation.xlsx is.
 * @param outputPath (optional) A string representation the outputPath where the resulting <language>.json should be created.
 * @example
 * ```typescript
 * const res = importTranslation({inputPath: path.join(process.cwd(), 'translation.xlsx')})
 * ```
 */
function importTranslation({
  inputPath,
  outputPath = process.cwd(),
}: {
  inputPath: string;
  outputPath?: string;
}) {
  const buf = readFileSync(inputPath);
  const workbook = read(buf);

  const worksheet = workbook.Sheets[config.get('worksheetName') as string];

  const temp: {
    translationKey: string;
    meta: string;
    [key: string]: string;
  }[] = utils.sheet_to_json(worksheet);

  const languages = Object.keys(temp[0]).slice(2);

  languages.forEach((language) => {
    const data = deflattenObject(
      temp.reduce(
        (acc, row) => ({
          [row.translationKey]: row[language].length ? row[language] : null,
          ...acc,
        }),
        {},
      ),
    );

    // format file with prettier
    const formattedData = prettier.format(JSON.stringify(data), {
      parser: 'json-stringify',
      tabWidth: 2,
      singleQuote: true,
      trailingComma: 'all',
      printWidth: 80,
      endOfLine: 'auto',
    });

    writeFileSync(path.join(outputPath, `/${language}.json`), formattedData);
  });

  return outputPath;
}

export { importTranslation };
