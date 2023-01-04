/**
 * generateTypes should take an json file and create a type definition out of it. A output location is optionally provided. If no location was provided the result should be printed to stdout.
 */
import { flattenObject, getParams } from '../utils';
import fs from 'node:fs';
import prettier from 'prettier';

export function generateTypes(inputFilename: string): string {
  const data = fs.readFileSync(inputFilename, 'utf8');

  // Flatten object
  const flatObject = flattenObject(JSON.parse(data) as Record<string, unknown>);

  const translationTypes: string[] = [];
  for (const key in flatObject) {
    const params = getParams(flatObject[key] as string);

    if (params) {
      const formatedParams = params
        .map((param) => `${param}: string`)
        .join(', ');
      translationTypes.push(`['${key}', {params: {${formatedParams}}}]`);
    } else {
      translationTypes.push(`['${key}']`);
    }
  }

  let outputData = `
        /*~ Type definitions for t9n
         *~ Definitions generated by: generateTypes.ts */

        export type TranslationArgs = ${translationTypes.join(' | ')};
        `;

  // Format file with prettier
  outputData = prettier.format(outputData, {
    parser: 'typescript',
    tabWidth: 2,
    singleQuote: true,
    trailingComma: 'all',
    printWidth: 80,
    endOfLine: 'auto',
  });

  return outputData;
}
