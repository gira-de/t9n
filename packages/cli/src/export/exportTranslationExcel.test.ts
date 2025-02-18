import { exportTranslationExcel, snapshotAndCommit} from './exportTranslationExcel';
import fs from 'node:fs';
import path from 'node:path';
import { read, utils } from 'xlsx';
import { GitMock } from './gitMock';

const inputPath = path.join(process.cwd(), 'tests/fixtures/');
const outputPath = path.join(process.cwd(), 'out');
const setupMocks = (fileExists, fileContent, lastCommitContent) => {
  fs.existsSync = jest.fn().mockReturnValue(fileExists);
  fs.readFileSync = jest.fn().mockReturnValue(fileContent);
  fs.writeFileSync = jest.fn();
  console.log = jest.fn();
  console.error = jest.fn();

  const mock = new GitMock(lastCommitContent);
  return mock;
};

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

  test('Ensure devOnly keys are not exported', () => {
    const storagePath = exportTranslationExcel({ inputPath, outputPath });

    const buf = fs.readFileSync(storagePath);
    const workbook = read(buf);

    const worksheet = workbook.Sheets['Translation'];

    const columns: {
      translationKey: string;
      meta: string;
      [key: string]: string;
    }[] = utils.sheet_to_json(worksheet);

    // Ensure the devOnly keys are not present in the exported file
    columns.forEach((row) => {
      expect(row.translationKey).not.toContain('devOnly');
    });
  });
});

describe('snapshotAndCommit', () => {
  it('should not commit if the file has not changed since the last commit', async () => {
    const mock = setupMocks(true, 'File content', 'File content');
    const inputPath = 'test.txt';
    const commitMessage = 'Test commit';

    await snapshotAndCommit(inputPath, commitMessage, mock);

    expect(console.log).toHaveBeenCalledWith('No changes detected. No new snapshot commit necessary.');
    expect(fs.writeFileSync).not.toHaveBeenCalled();
    expect(mock.addCalls).toEqual([]);
    expect(mock.commitCalls).toEqual([]);
    expect(mock.showCalls).toEqual([['test.txt', 'result']]);
  });

  it('should log an error if the file is not found', async () => {
    const mock = setupMocks(false, '', '');
    const inputPath = 'nonexistent.txt';
    const commitMessage = 'Test commit';

    await snapshotAndCommit(inputPath, commitMessage, mock);

    expect(console.error).toHaveBeenCalledWith(`File not found: ${inputPath}`);
  });

  it('should create and commit a snapshot if the file has changed', async () => {
    const mock = setupMocks(true, 'New content', 'Old content');
    const inputPath = 'test.txt';
    const commitMessage = 'Test commit';

    await snapshotAndCommit(inputPath, commitMessage, mock);

    expect(fs.writeFileSync).toHaveBeenCalledWith(`${inputPath}.snapshot`, 'New content');
    expect(mock.addCalls).toEqual([`${inputPath}.snapshot`]);
    expect(mock.commitCalls).toEqual([[commitMessage, `${inputPath}.snapshot`]]);
    expect(console.log).toHaveBeenCalledWith(`Snapshot created and committed: ${inputPath}.snapshot`);
  });

  it('should create a snapshot path correctly', async () => {
    const mock = setupMocks(true, 'New content', 'Old content');
    const inputPath = 'test.txt';
    const commitMessage = 'Test commit';

    await snapshotAndCommit(inputPath, commitMessage, mock);

    const expectedSnapshotPath = `${inputPath}.snapshot`;
    expect(fs.writeFileSync).toHaveBeenCalledWith(expectedSnapshotPath, 'New content');
    expect(mock.addCalls).toEqual([expectedSnapshotPath]);
    expect(mock.commitCalls).toEqual([[commitMessage, expectedSnapshotPath]]);
    expect(console.log).toHaveBeenCalledWith(`Snapshot created and committed: ${expectedSnapshotPath}`);
  });

  it('should log an error if there is an error during the commit process', async () => {
    const mock = setupMocks(true, 'New content', 'Old content');
    const inputPath = 'test.txt';
    const commitMessage = 'Test commit';
    fs.writeFileSync = jest.fn().mockImplementation(() => { throw new Error('Write error'); });

    await snapshotAndCommit(inputPath, commitMessage, mock);

    expect(console.error).toHaveBeenCalledWith('Error creating snapshot and committing: Write error');
  });
});
