export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: [
    '**/__tests__/Controllers/**/*.test.js',
    '**/__tests__/integration/**/*.test.js'
  ],
  moduleFileExtensions: ['js', 'json'],
  collectCoverageFrom: [
    'server/Controllers/**/*.js',
    'server/Routes/**/*.js',
    'server/Middleware/**/*.js',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  testTimeout: 120000,
  moduleNameMapper: {
    '^../../Models/(.*)$': '<rootDir>/server/Models/$1',
    '^../../Controllers/(.*)$': '<rootDir>/server/Controllers/$1',
    '^../../Routes/(.*)$': '<rootDir>/server/Routes/$1'
  }
};

