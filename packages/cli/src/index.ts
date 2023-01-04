#!/usr/bin/env node
import checkCli from './check';
import exportCli from './export';
import typedefCli from './generateTypes';
import importCli from './import';
import meow from 'meow';
import type { Result } from 'meow';

function main(
  cli: Result<{
    output: {
      type: 'string';
      alias: string;
    };
  }>,
) {
  const { input, showHelp } = cli;
  const command = input[0];

  switch (command) {
    case 'typedefs': {
      typedefCli();
      break;
    }

    case 'export': {
      exportCli();
      break;
    }

    case 'import': {
      importCli();
      break;
    }

    case 'check': {
      checkCli();
      break;
    }

    default:
      console.error(
        'Missing argument or unknown flag. Please see the following instructions:',
      );
      showHelp(0);
      break;
  }
}

const cli = meow(
  `
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

main(cli);
