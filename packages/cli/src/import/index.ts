import { importTranslation } from './importTranslationExcel';
import meow from 'meow';
import { writeFileSync } from 'node:fs';
import ora from 'ora';

function importCli(_cli: typeof cli) {
  const { input, flags, showHelp } = _cli;

  if (!input[1]) {
    console.error(
      'Missing argument or unknown flag. Please see the following instructions:',
    );
    showHelp(0);
  }

  const spinner = ora('Importing translation.xlsx...').start();

  const inputPath = input[1];
  const outputPath = flags.output;

  importTranslation({ inputPath, outputPath, outputSink: writeFileSync });

  spinner.stop();
  process.exit(0);
}

const cli = meow(
  `
  🔁🔁🔁
  Import a translation.xlsx and create <language>.json file out of it (like de.json, en.json,...).

  Usage
    $ import <input> [--output <output>]
  
  Options
    --output, -o  output path relative from execution path
  
  Examples
    $ import tests/fixtures/translation.xlsx -o src
  `,
  {
    importMeta: import.meta,
    flags: {
      output: {
        type: 'string',
        alias: 'o',
      },
    },
  },
);

export default () => importCli(cli);
