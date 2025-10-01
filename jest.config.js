module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testMatch: ['**/tests/**/*.test.ts', '**/tests/**/*.test.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
};
