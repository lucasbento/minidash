module.exports = {
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.+(ts)", "**/?(*.)+(spec).+(ts)"],
  transform: {
    "^.+\\.(ts)$": "ts-jest",
  },
  setupFiles: ["./jest.setup.js"],
};
