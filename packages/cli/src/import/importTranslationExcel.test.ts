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

  test('Import translation.xlsx successfully', () => {
    const inputPath = path.join(
      process.cwd(),
      `tests/fixtures/translation.xlsx`,
    );

    const mockOutputSink = jest.fn();

    const res = importTranslation({
      inputPath,
      outputPath,
      outputSink: mockOutputSink,
    });

    // Function should return the storage path
    expect(res).toBe(outputPath);

    // Expect tests/de.json and tests/en.json to exist.
    expect(mockOutputSink).toHaveBeenCalledTimes(2);
    const dataEN = JSON.parse(mockOutputSink.mock.calls[0][1]);
    expect(dataEN).toEqual({
      pageOne: {
        headline: 'This is a headline',
      },
    });
    const dataDE = JSON.parse(mockOutputSink.mock.calls[1][1]);
    expect(dataDE).toEqual({
      pageOne: {
        headline: 'Das ist eine Überschrift',
      },
      pageTwo: {
        description: 'Das ist eine Beschreibung mit {{ params }}!',
      },
    });
  });
  test('Import translation with numeric keys', () => {
    const inputPath = path.join(
      process.cwd(),
      `tests/fixtures/translation-numeric-keys.xlsx`,
    );

    const mockOutputSink = jest.fn();

    const res = importTranslation({
      inputPath,
      outputPath,
      outputSink: mockOutputSink,
    });

    // Expect tests/de.json and tests/en.json to exist.
    expect(mockOutputSink).toHaveBeenCalledTimes(1);
    const dataEN = JSON.parse(mockOutputSink.mock.calls[0][1]);
    expect(dataEN).toEqual({
      unit: {
        2: 'Two',
        3: 'Three',
        5: 'Five',
      },
    });
  });
});
