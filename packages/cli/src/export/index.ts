import { exportTranslationExcel } from './exportTranslationExcel';
import meow from 'meow';
import ora from 'ora';

function exportCli(_cli: typeof cli) {
  const { input, flags, showHelp } = _cli;

  if (!input[1]) {
    console.error(
      'Missing argument or unknown flag. Please see the following instructions:',
    );
    showHelp(0);
  }

  const spinner = ora('Exporting translation.xlsx...').start();

  const inputPath = input[1];
  const outputPath = flags.output;

  exportTranslationExcel({ inputPath, outputPath });
  spinner.stop();
  process.exit(0);
}

const cli = meow(
  `
  🚀🚀🚀
  This command creates a xlxs translation file based on a meta.json within a given folder. If there are additional languages files (for example de.json, en.json) within this folder, the command will put this into the resulting xlsx too.
  
  Usage
    $ export <inputFolder> [--output <output>]
  
  Options
    --output, -o  output path relative from execution path
  
  Examples
    $ export tests/fixtures --output bin/export
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

export default () => exportCli(cli);
