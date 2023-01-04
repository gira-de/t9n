import { generateTypes } from './generateTypes';
import path from 'node:path';

const testInPath = path.join(process.cwd(), 'tests/fixtures');

describe('test generateTypes', () => {
  test('should generate types and print out type definition', () => {
    const res = generateTypes(path.join(testInPath, '/meta.json'));

    expect(res.startsWith('/*~ Type definitions for t9n')).toBeTruthy();
  });
});
