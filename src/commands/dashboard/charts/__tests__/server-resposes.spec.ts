import { setupChartTest } from "../../../../testUtils";
import { createServerResponsesChart } from "../server-responses";

describe("createServerResponsesChart", () => {
  const { grid, logs, logsGroupedByHour, setData, cleanUp } = setupChartTest();
  const chartArgs = {
    grid,
    logs,
    logsGroupedByHour,
  };

  const logHours = Object.keys(logsGroupedByHour);
  const logsFromLogHours = Object.values(logsGroupedByHour);

  afterEach(() => cleanUp());

  it("should create server responses chart", () => {
    createServerResponsesChart(chartArgs);

    expect(grid.set).toHaveBeenCalledTimes(1);

    expect(setData).toHaveBeenCalledWith([
      expect.objectContaining({
        x: logHours,
        y: logsFromLogHours.map((log) => log.numberOfSuccessResponses),
      }),
      expect.objectContaining({
        x: logHours,
        y: logsFromLogHours.map((log) => log.numberOfFailedResponses),
      }),
    ]);
    expect(setData).toHaveBeenCalledTimes(1);
  });
});
