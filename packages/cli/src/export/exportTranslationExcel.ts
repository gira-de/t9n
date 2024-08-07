import { flattenObject, getFilesFromFolder } from '../utils';
import Conf from 'conf';
import path from 'node:path';
import * as XLSX from 'xlsx';
import fs from 'fs';

XLSX.set_fs(fs);

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

if (!config.get('version')) config.set('version', '0.0.1');
if (!config.get('worksheetName')) config.set('worksheetName', 'Translation');
if (!config.get('languages')) config.set('languages', ['meta', 'de', 'en']);

/**
 * @param inputPath A string representing the path where at least a meta.json exists.
 * @param outputPath A string representing the path where the resulting translation.xlsx should be stored.
 * @returns A promise resolving with the storage path.
 * @example
 * ```typescript
 * const response = exportTranslationExcel({inputPath: 'static/folder', outputPath: 'output/folder'})
 * ```
 */

function exportTranslationExcel({
  inputPath,
  outputPath = process.cwd(),
}: {
  inputPath: string;
  outputPath?: string;
}) {
  let metaData,
    existingData = [];

  try {
    const allFiles = getFilesFromFolder(inputPath);

    existingData = allFiles.map((file) => flattenObject(file));

    metaData = existingData.splice(
      existingData.findIndex((el) => el.__filename === 'meta'),
      1,
    );
  } catch (error) {
    console.error(error);
  }

  /**
   * data should look like this:
   * [
   *  {
   *    translationKey: string,
   *    meta: string,
   *    de: string
   *  },
   *  ...
   * ]
   */

  // Remove the __filename attribute from meta.json since we don't need it in the upcoming iteration.
  delete metaData[0].__filename;

  const data = Object.entries(metaData[0]).map(([translationKey, meta]) => {
    const res = (config.get('languages') as string[])
      .slice(1)
      .reduce((acc, language) => {
        const languageObject =
          existingData.find((lang) => lang.__filename === language) ?? {};

        return {
          [language]: Object.prototype.hasOwnProperty.call(
            languageObject,
            translationKey,
          )
            ? languageObject[translationKey]
            : '',
          ...acc,
        };
      }, {});

    return {
      translationKey,
      meta,
      ...res,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  // Append a description sheet with some meta data like version and export date.
  const today = new Date(Date.now());

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.aoa_to_sheet([
      ['Version', config.get('version')],
      ['Created at', today.toLocaleDateString('de')],
    ]),
    'Description',
  );

  // Append the actual data
  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    config.get('worksheetName') as string,
  );

  const storagePath = path.join(outputPath, 'translation.xlsx');

  try {
    XLSX.writeFile(workbook, storagePath);
    return storagePath;
  } catch (error) {
    console.error(
      `Could not write XLSX to specified output path. Please make sure the path: ${storagePath} exists.`,
    );
    console.error(error);
    return;
  }
}

export { exportTranslationExcel, getFilesFromFolder };
