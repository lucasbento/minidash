import contrib from "blessed-contrib";
import { setupChartTest } from "../../../../testUtils";
import { createAverageRequestTimeChart } from "../average-request-time";

describe("createAverageRequestTimeChart", () => {
  const { grid, logs, logsGroupedByHour, setData, cleanUp } = setupChartTest();
  const chartArgs = {
    grid,
    logs,
    logsGroupedByHour,
  };

  afterEach(() => cleanUp());

  it("should create average request time chart", () => {
    const requestsTime = logs.map((log) => log.requestTime).filter(Boolean);

    createAverageRequestTimeChart(chartArgs);

    expect(grid.set).toHaveBeenCalledTimes(1);
    expect(setData).toHaveBeenCalledWith(expect.anything(), [requestsTime]);
    expect(setData).toHaveBeenCalledTimes(1);
  });
});
