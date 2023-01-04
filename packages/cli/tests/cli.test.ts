import { execSync } from 'child_process';
import fs from 'node:fs';
import path from 'node:path';

const binPath = path.join(process.cwd(), 'bin/cli.js');
const inputPath = path.join(process.cwd(), 'tests/fixtures');
const outputPath = path.join(process.cwd(), 'out');

const exec = (command: string, ...args: string[]) =>
  execSync(
    `node ${binPath} ${command} ${args.reduce(
      (prev, curr) => `${prev} '${curr}'`,
      '',
    )}`,
    { stdio: 'pipe' },
  );

beforeAll(() => {
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath);
  }
});

describe('Test main', () => {
  test('should show help', () => {
    const stdout = exec('');

    expect(stdout.includes('🌏🌏🌏')).toBeTruthy();
  });
});

describe('Test typedefs', () => {
  const testInputFile = path.join(inputPath, 'meta.json');
  const testOutputFile = path.join(outputPath, 'locale-types.ts');

  beforeAll(() => {
    fs.rmSync(testOutputFile, { force: true });
  });

  test('should show help', () => {
    const stdout = exec('typedefs');

    expect(stdout.includes('🔡🔡🔡')).toBeTruthy();
  });

  test('should run without errors', () => {
    exec('typedefs', testInputFile, '--output', testOutputFile);

    expect(fs.existsSync(testOutputFile)).toBeTruthy();
  });
});

describe('Test export', () => {
  const testOutputFile = path.join(outputPath, 'translation.xlsx');

  beforeAll(() => {
    fs.rmSync(testOutputFile, { force: true });
  });

  test('should show help', () => {
    const stdout = exec('export');

    expect(stdout.includes('🚀🚀🚀')).toBeTruthy();
  });

  test('should run without errors', () => {
    const stdout = exec('export', inputPath, '--output', outputPath);

    expect(fs.existsSync(testOutputFile)).toBeTruthy();
  });
});

describe('Test import', () => {
  const testOutputFileDe = path.join(outputPath, 'de.json');
  const testOutputFileEn = path.join(outputPath, 'en.json');

  beforeAll(() => {
    fs.rmSync(testOutputFileDe, { force: true });
    fs.rmSync(testOutputFileEn, { force: true });
  });

  test('should show help', () => {
    const stdout = exec('import');

    expect(stdout.includes('🔁🔁🔁')).toBeTruthy();
  });

  test('should run without errors', () => {
    const inputFile = path.join(inputPath, 'translation.xlsx');

    exec('import', inputFile, '--output', outputPath);

    expect(fs.existsSync(testOutputFileDe)).toBeTruthy();
    expect(fs.existsSync(testOutputFileEn)).toBeTruthy();
  });
});

describe('Test check', () => {
  test('should show help', () => {
    const stdout = exec('check');

    expect(stdout.includes('🕵️🕵️🕵️')).toBeTruthy();
  });

  test('should run without errors', () => {
    exec('check', inputPath);
  });
});
