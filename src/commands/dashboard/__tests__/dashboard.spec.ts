import blessed from "blessed";
import contrib from "blessed-contrib";
import { createDashboard } from "../dashboard";
import {
  runHealthCheckProcess,
  readHealthCheckLogsStream,
} from "../../health-check";
import {
  LogsGroupedByHourMock,
  MixedLogLinesMock,
} from "../../../__mocks__/logs";
import { SERVER_URL } from "../../../__mocks__/cli";
import { createAverageRequestTimeChart } from "../charts/average-request-time";
import { createServerResponsesChart } from "../charts/server-responses";
import { createServerStatusChart } from "../charts/server-status";
import { createSuccessPercentageChart } from "../charts/success-percentage";

jest.mock("../../health-check.ts", () => ({
  runHealthCheckProcess: jest.fn(),
  readHealthCheckLogsStream: jest.fn().mockReturnValue({
    on: jest.fn().mockImplementation((eventType, callback) => {
      if (eventType !== "data") {
        return;
      }

      callback(Buffer.from(JSON.stringify(MixedLogLinesMock)));
    }),
  }),
}));

jest.mock("../charts/average-request-time.ts", () => ({
  createAverageRequestTimeChart: jest.fn(),
}));
jest.mock("../charts/server-responses.ts", () => ({
  createServerResponsesChart: jest.fn(),
}));
jest.mock("../charts/server-status.ts", () => ({
  createServerStatusChart: jest.fn(),
}));
jest.mock("../charts/success-percentage.ts", () => ({
  createSuccessPercentageChart: jest.fn(),
}));

describe("createDashboard", () => {
  createDashboard({
    server: SERVER_URL,
    dashboardOnly: false,
    healthCheckOnly: false,
    mock: false,
  });

  it("should start health check process", () => {
    expect(runHealthCheckProcess).toHaveBeenCalledTimes(1);
  });

  it("should setup `blessed` & `blessed-contrib`", () => {
    expect(blessed.screen).toHaveBeenCalledTimes(1);
    expect(contrib.grid).toHaveBeenCalledTimes(1);
  });

  it("should start read health check logs stream", () => {
    expect(readHealthCheckLogsStream).toHaveBeenCalledTimes(1);
  });

  it("should create dashboard charts", () => {
    const chartArgs = {
      logsGroupedByHour: LogsGroupedByHourMock,
      logs: MixedLogLinesMock,
    };

    expect(createAverageRequestTimeChart).toHaveBeenCalledTimes(1);
    expect(createServerResponsesChart).toHaveBeenCalledTimes(1);
    expect(createServerStatusChart).toHaveBeenCalledTimes(1);
    expect(createSuccessPercentageChart).toHaveBeenCalledTimes(1);

    expect(createAverageRequestTimeChart).toHaveBeenCalledWith(
      expect.objectContaining(chartArgs)
    );
    expect(createServerResponsesChart).toHaveBeenCalledWith(
      expect.objectContaining(chartArgs)
    );
    expect(createServerStatusChart).toHaveBeenCalledWith(
      expect.objectContaining(chartArgs)
    );
    expect(createSuccessPercentageChart).toHaveBeenCalledWith(
      expect.objectContaining(chartArgs)
    );
  });
});
