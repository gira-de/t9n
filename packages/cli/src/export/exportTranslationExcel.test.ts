import { exportTranslationExcel } from './exportTranslationExcel';
import fs from 'node:fs';
import path from 'node:path';
import { read, utils } from 'xlsx';

const inputPath = path.join(process.cwd(), 'tests/fixtures/');
const outputPath = path.join(process.cwd(), 'out');

beforeAll(() => {
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath);
  }
});

describe('Test export translation.xlsx', () => {
  beforeEach(() => {
    // Delete test files if it already exists
    fs.rmSync(path.join(outputPath, 'translation.xlsx'), { force: true });
  });

  test('Create a translation.xlsx based on a provided meta.json', () => {
    const storagePath = exportTranslationExcel({ inputPath, outputPath });

    // Should return the storage path
    expect(storagePath).toBe(path.join(outputPath, 'translation.xlsx'));

    expect(
      fs.existsSync(path.join(outputPath, 'translation.xlsx')),
    ).toBeTruthy();
  });

  test('Check the created translation.xlsx', () => {
    const buf = fs.readFileSync(path.join(inputPath, 'translation.xlsx'));
    const workbook = read(buf);

    const worksheet = workbook.Sheets['Translation'];

    const columns: {
      translationKey: string;
      meta: string;
      [key: string]: string;
    }[] = utils.sheet_to_json(worksheet);

    expect(columns).toStrictEqual([
      {
        translationKey: 'pageOne.headline',
        meta: 'This is a headline',
        en: 'This is a headline',
        de: 'Das ist eine Überschrift',
      },
      {
        translationKey: 'pageTwo.description',
        meta: 'This is a description with {{ params }}!',
        en: '',
        de: 'Das ist eine Beschreibung mit {{ params }}!',
      },
      {
        translationKey: 'pageTwo.headline',
        meta: 'Another description {{ with }} {{two}} params!',
        en: '',
        de: '',
      },
    ]);
  });
});
