import blessed from "blessed";

export default {
  ...blessed,
  screen: jest.fn().mockReturnValue({
    key: jest.fn(),
    on: jest.fn(),
    render: jest.fn(),
  }),
};
