export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)test.ts'],
  coverageReporters: ['text', 'cobertura'],
  collectCoverageFrom: ['src/**/*.ts', 'main.ts'],
};
