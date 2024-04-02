/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    rootDir: './',
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    coverageDirectory: '<rootDir>/coverage',
    collectCoverageFrom: ['<rootDir>/packages/**/src/**/*.ts'],
    testPathIgnorePatterns: ['<rootDir>/node_modules/'],
    moduleFileExtensions: ['ts', 'js'],
    coverageReporters: ['json', 'lcov', 'html'],
    projects: ['<rootDir>/packages/*/jest.config.js'],
}