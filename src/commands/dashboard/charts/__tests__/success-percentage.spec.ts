import { setupChartTest } from "../../../../testUtils";
import {
  SERVER_HEALTH,
  createSuccessPercentageChart,
} from "../success-percentage";

describe("createSuccessPercentageChart", () => {
  const { grid, logs, logsGroupedByHour, setData, cleanUp } = setupChartTest();
  const chartArgs = {
    grid,
    logs,
    logsGroupedByHour,
  };

  afterEach(() => cleanUp());

  it("should create success percentage chart", () => {
    const expectedSuccessPercentage = "50";

    createSuccessPercentageChart(chartArgs);

    expect(grid.set).toHaveBeenCalledTimes(1);

    expect(setData).toHaveBeenCalledWith([
      {
        percent: expectedSuccessPercentage,
        label: SERVER_HEALTH[expectedSuccessPercentage].title,
        color: SERVER_HEALTH[expectedSuccessPercentage].color,
      },
    ]);
    expect(setData).toHaveBeenCalledTimes(1);
  });

  it("should create success percentage chart with `Excellent` server health", () => {
    const expectedSuccessPercentage = "90";

    createSuccessPercentageChart({
      ...chartArgs,
      logsGroupedByHour: {
        ...chartArgs.logsGroupedByHour,
        "13:30": {
          numberOfSuccessResponses: 65,
          numberOfFailedResponses: 0,
        },
      },
    });

    expect(grid.set).toHaveBeenCalledTimes(1);

    expect(setData).toHaveBeenCalledWith([
      {
        percent: "95",
        label: SERVER_HEALTH[expectedSuccessPercentage].title,
        color: SERVER_HEALTH[expectedSuccessPercentage].color,
      },
    ]);
    expect(setData).toHaveBeenCalledTimes(1);
  });
});
