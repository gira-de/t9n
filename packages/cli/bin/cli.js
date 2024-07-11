#!/usr/bin/env node
import fs, { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import meow from 'meow';
import ora from 'ora';
import Conf from 'conf';
import * as XLSX from 'xlsx';
import { read, utils } from 'xlsx';
import prettier from 'prettier';

/**
 * Flatten the provided object
 *
 * @param obj An object
 * @param keySeparator The separator that should be applied
 * @returns A object without any nested objects
 */
function flattenObject(obj, keySeparator = '.') {
    const flattenRecursive = (obj, parentProperty, propertyMap = {}) => {
        for (const [key, value] of Object.entries(obj)) {
            const property = parentProperty
                ? `${parentProperty}${keySeparator}${key}`
                : key;
            if (value && typeof value === 'object') {
                flattenRecursive(value, property, propertyMap);
            }
            else {
                propertyMap[property] = value;
            }
        }
        return propertyMap;
    };
    return flattenRecursive(obj);
}
/**
 * Deflattens the provided object
 *
 * @param ob The object to deflatten
 */
function deflattenObject(ob) {
    const result = {};
    for (const i in ob) {
        if (Object.prototype.hasOwnProperty.call(ob, i)) {
            const keys = i.match(/^\.+[^.]*|[^.]*\.+$|(?:\.{2,}|[^.])+(?:\.+$)?/g);
            keys.reduce((r, e, j) => {
                return (r[e] ||
                    (r[e] = isNaN(Number(keys[j + 1]))
                        ? keys.length - 1 === j
                            ? ob[i]
                            : {}
                        : []));
            }, result);
        }
    }
    return result;
}
function getParams(text) {
    const matches = text.match(/{{(.*?)}}/g);
    return matches === null || matches === void 0 ? void 0 : matches.map((match) => match.substring(2, match.length - 2).trim());
}
/**
 *
 * @param inputPath Path to the input folder
 * @returns {__filename: "meta.json", keyOne: 'foo'}
 */
function getFilesFromFolder(inputPath) {
    const jsonList = fs
        .readdirSync(inputPath)
        .filter((file) => path.extname(file) === '.json')
        .map((file) => (Object.assign({ __filename: path.basename(file, '.json') }, JSON.parse(fs.readFileSync(path.join(inputPath, file)).toString()))));
    if (!!jsonList.find((file) => file.__filename === 'meta'))
        return jsonList;
    else
        throw Error(`Could not find a meta.json file in the provided folder: ${inputPath}`);
}

function validateLanguageJson({ reference, data, }) {
    const res = Object.entries(reference).reduce((acc, [key, value]) => {
        const _res = acc;
        // Increment the translationKey count
        _res.translationKeys = acc.translationKeys + 1;
        // Increment the missingTranslationKey count if the translationKey could not be found
        if (!data[key])
            _res.missingTranslationKeys = acc.missingTranslationKeys + 1;
        else {
            // Check for parameters
            const referenceParams = getParams(value);
            if (typeof referenceParams !== 'undefined') {
                const params = getParams(data[key]);
                if (referenceParams.length !== (params === null || params === void 0 ? void 0 : params.length))
                    _res.missingParams = [key, ...acc.missingParams];
            }
        }
        // Calculate the translationKey coverage and round it
        _res.coverage = Number(((acc.translationKeys - acc.missingTranslationKeys) /
            acc.translationKeys).toFixed(2));
        return _res;
    }, {
        __filename: data.__filename,
        translationKeys: 0,
        missingTranslationKeys: 0,
        coverage: 0,
        missingParams: [],
    });
    return res;
}
function check(inputPath) {
    const allLanguages = getFilesFromFolder(inputPath).map((obj) => flattenObject(obj));
    // Split the data array in an array with meta.json and another one with the <language>.jsons
    const reference = allLanguages.splice(allLanguages.findIndex((el) => el.__filename === 'meta'), 1)[0];
    delete reference.__filename;
    const checkResults = allLanguages.map((data) => validateLanguageJson({ reference, data }));
    return checkResults;
}

function exportCli$2(_cli) {
    const { input, showHelp } = _cli;
    if (!input[1]) {
        console.error('Missing argument or unknown flag. Please see the following instructions:');
        showHelp(0);
    }
    const spinner = ora('Checking folder...').start();
    const inputPath = input[1];
    const result = check(inputPath);
    spinner.stop();
    console.table(result);
    process.exit(0);
}
const cli$4 = meow(`
  🕵️🕵️🕵️
  This command checks all <language>.json compared to a meta.json reference within a given folder. The result will be printed to stdout.
  
  Usage
    $ check <inputFolder>
  
  Examples
    $ check tests/fixtures
  `, {
    importMeta: import.meta,
});
var checkCli = () => exportCli$2(cli$4);

/**
 * Config handling
 */
const config$1 = new Conf({
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
if (!config$1.get('version'))
    config$1.set('version', '0.0.1');
if (!config$1.get('worksheetName'))
    config$1.set('worksheetName', 'Translation');
if (!config$1.get('languages'))
    config$1.set('languages', ['meta', 'de', 'en']);
/**
 * @param inputPath A string representing the path where at least a meta.json exists.
 * @param outputPath A string representing the path where the resulting translation.xlsx should be stored.
 * @returns A promise resolving with the storage path.
 * @example
 * ```typescript
 * const response = exportTranslationExcel({inputPath: 'static/folder', outputPath: 'output/folder'})
 * ```
 */
function exportTranslationExcel({ inputPath, outputPath = process.cwd(), }) {
    let metaData, existingData = [];
    try {
        const allFiles = getFilesFromFolder(inputPath);
        existingData = allFiles.map((file) => flattenObject(file));
        metaData = existingData.splice(existingData.findIndex((el) => el.__filename === 'meta'), 1);
    }
    catch (error) {
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
        const res = config$1.get('languages')
            .slice(1)
            .reduce((acc, language) => {
            var _a;
            const languageObject = (_a = existingData.find((lang) => lang.__filename === language)) !== null && _a !== void 0 ? _a : {};
            return Object.assign({ [language]: Object.prototype.hasOwnProperty.call(languageObject, translationKey)
                    ? languageObject[translationKey]
                    : '' }, acc);
        }, {});
        return Object.assign({ translationKey,
            meta }, res);
    });
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    // Append a description sheet with some meta data like version and export date.
    const today = new Date(Date.now());
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
        ['Version', config$1.get('version')],
        ['Created at', today.toLocaleDateString('de')],
    ]), 'Description');
    // Append the actual data
    XLSX.utils.book_append_sheet(workbook, worksheet, config$1.get('worksheetName'));
    const storagePath = path.join(outputPath, 'translation.xlsx');
    try {
        XLSX.writeFile(workbook, storagePath);
        return storagePath;
    }
    catch (error) {
        console.error(`Could not write XLSX to specified output path. Please make sure the path: ${storagePath} exists.`);
        console.error(error);
        return;
    }
}

function exportCli(_cli) {
    const { input, flags, showHelp } = _cli;
    if (!input[1]) {
        console.error('Missing argument or unknown flag. Please see the following instructions:');
        showHelp(0);
    }
    const spinner = ora('Exporting translation.xlsx...').start();
    const inputPath = input[1];
    const outputPath = flags.output;
    exportTranslationExcel({ inputPath, outputPath });
    spinner.stop();
    process.exit(0);
}
const cli$3 = meow(`
  🚀🚀🚀
  This command creates a xlxs translation file based on a meta.json within a given folder. If there are additional languages files (for example de.json, en.json) within this folder, the command will put this into the resulting xlsx too.
  
  Usage
    $ export <inputFolder> [--output <output>]
  
  Options
    --output, -o  output path relative from execution path
  
  Examples
    $ export tests/fixtures --output bin/export
  `, {
    importMeta: import.meta,
    flags: {
        output: {
            type: 'string',
            alias: 'o',
        },
    },
});
var exportCli$1 = () => exportCli(cli$3);

/**
 * generateTypes should take an json file and create a type definition out of it. A output location is optionally provided. If no location was provided the result should be printed to stdout.
 */
function generateTypes(inputFilename) {
    const data = fs.readFileSync(inputFilename, 'utf8');
    // Flatten object
    const flatObject = flattenObject(JSON.parse(data));
    const translationTypes = [];
    for (const key in flatObject) {
        const params = getParams(flatObject[key]);
        if (params) {
            const formattedParams = params
                .map((param) => `${param}: string`)
                .join(', ');
            translationTypes.push(`['${key}', {params: {${formattedParams}}}]`);
        }
        else {
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

function generateTypesCli(_cli) {
    const { input, flags, showHelp } = _cli;
    if (!input[1]) {
        console.error('Missing argument or unknown flag. Please see the following instructions:');
        showHelp(0);
    }
    const spinner = ora('Generating typedefs...').start();
    const inputFilename = input[1];
    const outputFilename = flags.output;
    const result = generateTypes(inputFilename);
    // Write declaration file
    if (outputFilename) {
        try {
            fs.writeFileSync(outputFilename, result);
        }
        catch (err) {
            console.error(err);
            spinner.fail('Could not write declaration file!');
            process.exit(1);
        }
    }
    else {
        console.log(result);
    }
    spinner.stop();
    process.exit(0);
}
const cli$2 = meow(`
  🔡🔡🔡
  Generate a Typescript declaration file (.d.ts) based on the provided meta.json.

  Usage
    $ typedefs <meta.json> [--output <output>]
  
  Options
    --output, -o  Filename and -path
  
  Examples
    $ typedefs meta.json -o bin/index.d.ts
  `, {
    importMeta: import.meta,
    flags: {
        output: {
            type: 'string',
            alias: 'o',
        },
    },
});
var typedefCli = () => generateTypesCli(cli$2);

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
function importTranslation({ inputPath, outputPath = process.cwd(), }) {
    const buf = readFileSync(inputPath);
    const workbook = read(buf);
    const worksheet = workbook.Sheets[config.get('worksheetName')];
    const temp = utils.sheet_to_json(worksheet);
    const languages = Object.keys(temp[0]).slice(2);
    languages.forEach((language) => {
        function reduceRow(result, row) {
            const translation = row[language]
            if (translation !== undefined && translation.length > 0) {
                result[row.translationKey] = translation
            }
            return result
        }
        const data = deflattenObject(temp.reduce(reduceRow, {}));

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

function importCli(_cli) {
    const { input, flags, showHelp } = _cli;
    if (!input[1]) {
        console.error('Missing argument or unknown flag. Please see the following instructions:');
        showHelp(0);
    }
    const spinner = ora('Importing translation.xlsx...').start();
    const inputPath = input[1];
    const outputPath = flags.output;
    importTranslation({ inputPath, outputPath });
    spinner.stop();
    process.exit(0);
}
const cli$1 = meow(`
  🔁🔁🔁
  Import a translation.xlsx and create <language>.json file out of it (like de.json, en.json,...).

  Usage
    $ import <input> [--output <output>]
  
  Options
    --output, -o  output path relative from execution path
  
  Examples
    $ import tests/fixtures/translation.xlsx -o src
  `, {
    importMeta: import.meta,
    flags: {
        output: {
            type: 'string',
            alias: 'o',
        },
    },
});
var importCli$1 = () => importCli(cli$1);

function main(cli) {
    const { input, showHelp } = cli;
    const command = input[0];
    switch (command) {
        case 'typedefs': {
            typedefCli();
            break;
        }
        case 'export': {
            exportCli$1();
            break;
        }
        case 'import': {
            importCli$1();
            break;
        }
        case 'check': {
            checkCli();
            break;
        }
        default:
            console.error('Missing argument or unknown flag. Please see the following instructions:');
            showHelp(0);
            break;
    }
}
const cli = meow(`
🌏🌏🌏
A small Nodejs based CLI that provides some tools to enable i18n.

Usage
  $ typedefs <input> [--output <output>]
  $ export <inputFolder> [--output <output>]
  $ import <input> [--output <output>]
  $ check <inputFolder>

Commands
  typedefs  Create a Typescript declaration (d.ts) based on a provided meta.json.  
  export    Generate a translation.xlsx by providing a folder with at least a meta.json and any number of language.json files (like de.json, en.json).
  import    Import a translation.xlsx and create <language>.json file out of it (like de.json, en.json,...).
  check     Generate a report.

Options
  --output, -o  output path relative from execution path

Examples
  $ meta.json -o bin/index.d.ts
`, {
    importMeta: import.meta,
    flags: {
        output: {
            type: 'string',
            alias: 'o',
        },
    },
});
main(cli);
