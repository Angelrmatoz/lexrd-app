import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}', '**/*.test.{ts,tsx}'],
  moduleDirectories: ['node_modules', '<rootDir>'],
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    '!components/ui/**',
    '!**/node_modules/**',
  ],
};

export default createJestConfig(config);
