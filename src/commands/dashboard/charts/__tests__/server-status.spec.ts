import { setupChartTest } from "../../../../testUtils";
import { ResponseType } from "../../../../types/types";
import { SingleLogLineMock } from "../../../../__mocks__/logs";
import { createServerStatusChart } from "../server-status";

describe("createServerStatusChart", () => {
  const { grid, logs, logsGroupedByHour, gridSet, cleanUp } = setupChartTest();
  const chartArgs = {
    grid,
    logs,
    logsGroupedByHour,
  };

  afterEach(() => cleanUp());

  it("should create server status chart", () => {
    createServerStatusChart(chartArgs);

    expect(grid.set).toHaveBeenCalledTimes(1);
    expect(gridSet.mock.calls).toMatchSnapshot();
  });

  it("should create server status chart with status of `UNREACHABLE`", () => {
    createServerStatusChart({
      ...chartArgs,
      logs: [
        ...chartArgs.logs,
        SingleLogLineMock[ResponseType.SERVER_UNREACHABLE],
      ],
    });

    expect(grid.set).toHaveBeenCalledTimes(1);
    expect(gridSet.mock.calls).toMatchSnapshot();
  });

  it("should create server status chart with status of `UNREACHABLE` if there are 5 logs with FAILED `responseType`", () => {
    createServerStatusChart({
      ...chartArgs,
      logs: [
        ...chartArgs.logs,
        SingleLogLineMock[ResponseType.FAILED],
        SingleLogLineMock[ResponseType.FAILED],
        SingleLogLineMock[ResponseType.FAILED],
        SingleLogLineMock[ResponseType.FAILED],
        SingleLogLineMock[ResponseType.FAILED],
      ],
    });

    expect(grid.set).toHaveBeenCalledTimes(1);
    expect(gridSet.mock.calls).toMatchSnapshot();
  });

  it("should create server status chart with status of `UP` if there are less than 5 logs with FAILED `responseType`", () => {
    createServerStatusChart({
      ...chartArgs,
      logs: [
        ...chartArgs.logs,
        SingleLogLineMock[ResponseType.FAILED],
        SingleLogLineMock[ResponseType.FAILED],
        SingleLogLineMock[ResponseType.FAILED],
        SingleLogLineMock[ResponseType.FAILED],
      ],
    });

    expect(grid.set).toHaveBeenCalledTimes(1);
    expect(gridSet.mock.calls).toMatchSnapshot();
  });
});
