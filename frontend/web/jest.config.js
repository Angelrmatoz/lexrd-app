const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const config = {
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

module.exports = createJestConfig(config);
