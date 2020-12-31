import { mocked } from "ts-jest/utils";
import blessed from "blessed";
import contrib from "blessed-contrib";
import { MixedLogLinesMock, LogsGroupedByHourMock } from "./__mocks__/logs";

const mockedContrib = mocked(contrib, true);

const setData = jest.fn();
const gridSet = jest.fn().mockReturnValue({
  setData,
});

(mockedContrib.grid as jest.MockInstance<any, any>).mockImplementation(() => ({
  set: gridSet,
}));

const cleanUpMocks = () => {
  gridSet.mockClear();
  setData.mockClear();
};

const setupChartTest = () => {
  const screen = blessed.screen();
  const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

  return {
    grid,
    logs: MixedLogLinesMock,
    logsGroupedByHour: LogsGroupedByHourMock,
    gridSet,
    setData,
    cleanUp: cleanUpMocks,
  };
};

export { setupChartTest };
