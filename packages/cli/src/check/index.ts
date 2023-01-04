import { check } from './check';
import meow from 'meow';
import ora from 'ora';

function exportCli(_cli: typeof cli) {
  const { input, showHelp } = _cli;

  if (!input[1]) {
    console.error(
      'Missing argument or unknown flag. Please see the following instructions:',
    );
    showHelp(0);
  }

  const spinner = ora('Checking folder...').start();

  const inputPath = input[1];

  const result = check(inputPath);

  spinner.stop();
  console.table(result);
  process.exit(0);
}

const cli = meow(
  `
  🕵️🕵️🕵️
  This command checks all <language>.json compared to a meta.json reference within a given folder. The result will be printed to stdout.
  
  Usage
    $ check <inputFolder>
  
  Examples
    $ check tests/fixtures
  `,
  {
    importMeta: import.meta,
  },
);

export default () => exportCli(cli);
