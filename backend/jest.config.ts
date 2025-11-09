import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  moduleFileExtensions: ["ts", "js", "json"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/index.ts",
    "!src/app.ts",
    "!src/**/__mocks__/**"
  ],
  coverageDirectory: "<rootDir>/coverage",
  moduleNameMapper: {
    "^contracts(.*)$": "<rootDir>/../packages/contracts/src$1"
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setupTests.ts"],
  clearMocks: true
};

export default config;
