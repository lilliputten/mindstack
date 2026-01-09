import nextJest from 'next/jest';
import type { Config } from '@jest/types';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig: Config.InitialOptions = {
  preset: 'ts-jest',
  // setupFiles: ['<rootDir>/jestSetup.js'],
  setupFilesAfterEnv: ['<rootDir>/src/jest/jestCommonSetup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // '^uuid$': require.resolve('uuid'), // Example for the 'uuid' package
    'next-auth/react': '<rootDir>/__mocks__/next-auth/react.js',
    'next-auth': '<rootDir>/__mocks__/next-auth/index.js',
  },
  transformIgnorePatterns: [
    // Ignore transformation for most node_modules, but allow specific packages to be transformed
    'node_modules/(?!.*@auth|.*@panva)',
  ],
  transform: {
    // Ensure we use the correct transform for TypeScript files
    '^.+\\.(ts|tsx|js|jsx)$': 'ts-jest',
    // '^.+\\.js$': ['babel-jest', { configFile: './babel.config.jest.js' }],
    // '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  // Support ES modules
  // extensionsToTreatAsEsm: ['.ts', '.tsx', '.js', '.jsx'], // Validation Error: Option: extensionsToTreatAsEsm: ['.ts', '.tsx', '.js', '.jsx'] includes '.js' which is always inferred based on type in its nearest package.json.
  extensionsToTreatAsEsm: ['.ts', '.tsx', '.jsx'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
