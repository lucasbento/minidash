jest.mock("blessed", () => jest.requireActual("./__mocks__/blessed.ts"));

jest.mock("blessed-contrib", () =>
  jest.requireActual("./__mocks__/blessed-contrib.ts")
);
