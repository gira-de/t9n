import { generateTypes } from './generateTypes';
import meow from 'meow';
import fs from 'node:fs';
import ora from 'ora';

function generateTypesCli(_cli: typeof cli) {
  const { input, flags, showHelp } = _cli;

  if (!input[1]) {
    console.error(
      'Missing argument or unknown flag. Please see the following instructions:',
    );
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
    } catch (err) {
      console.error(err);
      spinner.fail('Could not write declaration file!');
      process.exit(1);
    }
  } else {
    console.log(result);
  }

  spinner.stop();
  process.exit(0);
}

const cli = meow(
  `
  🔡🔡🔡
  Generate a Typescript declaration file (.d.ts) based on the provided meta.json.

  Usage
    $ typedefs <meta.json> [--output <output>]
  
  Options
    --output, -o  Filename and -path
  
  Examples
    $ typedefs meta.json -o bin/index.d.ts
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

export default () => generateTypesCli(cli);
