import { importTranslation } from './importTranslationExcel';
import fs from 'node:fs';
import path from 'node:path';

const outputPath = path.join(process.cwd(), 'out');

beforeAll(() => {
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath);
  }
});

describe('Test import translation excel features', () => {
  const testOutputFileDe = path.join(outputPath, 'de.json');
  const testOutputFileEn = path.join(outputPath, 'en.json');

  beforeEach(() => {
    fs.rmSync(testOutputFileDe, { force: true });
    fs.rmSync(testOutputFileEn, { force: true });
  });

  test('Import translation.xlsx successfully', () => {
    const inputPath = path.join(
      process.cwd(),
      `tests/fixtures/translation.xlsx`,
    );

    const res = importTranslation({ inputPath, outputPath });

    // Function should return the storage path
    expect(res).toBe(outputPath);

    // Expect tests/de.json and tests/en.json to exist.
    expect(fs.existsSync(testOutputFileDe)).toBeTruthy();
    expect(fs.existsSync(testOutputFileEn)).toBeTruthy();
  });
});
