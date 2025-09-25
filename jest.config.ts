import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: "jsdom",
  roots: ['test'],
  reporters: [
    'default',
    ['jest-stare', {"coverageLink":"../coverage/lcov-report/index.html"}],
    ["jest-junit", { outputDirectory: "./test-results", outputName: "junit.xml" }]
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/StillToBuild/"
  ],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': "babel-jest"
  }
};

export default config;