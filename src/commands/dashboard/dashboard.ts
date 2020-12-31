import blessed from "blessed";
import contrib from "blessed-contrib";
import { format } from "date-fns";
import {
  CLIFlags,
  LogLine,
  LogsGroupedByHour,
  ResponseType,
} from "../../types/types";
import { readHealthCheckLogsStream } from "../health-check";
import { mockReadHealthCheckLogsStream } from "../mock-health-check";
import { createAverageRequestTimeChart } from "./charts/average-request-time";
import { createServerResponsesChart } from "./charts/server-responses";
import { createServerStatusChart } from "./charts/server-status";
import { createSuccessPercentageChart } from "./charts/success-percentage";

const getHourFromLog = (log: LogLine) => {
  const date = new Date(log.date);
  const hour = format(date, "HH");
  const minutes = parseInt(format(date, "mm"));

  if (minutes >= 30) {
    return hour + ":30";
  }

  return hour + ":00";
};

const getLogsGroupedByHour = (logs: LogLine[]): LogsGroupedByHour => {
  const logsGroupedByHour = logs.reduce<LogsGroupedByHour>((allLogs, log) => {
    const hour = getHourFromLog(log);
    const isLogASuccessfulResponse =
      log.responseType === ResponseType.SUCCESSFUL;

    const logsInHour = allLogs[hour];

    const numberOfSuccessResponses = logsInHour?.numberOfSuccessResponses || 0;
    const numberOfFailedResponses = logsInHour?.numberOfFailedResponses || 0;

    return {
      ...allLogs,
      [hour]: {
        numberOfSuccessResponses: isLogASuccessfulResponse
          ? numberOfSuccessResponses + 1
          : numberOfSuccessResponses,
        numberOfFailedResponses: isLogASuccessfulResponse
          ? numberOfFailedResponses
          : numberOfFailedResponses + 1,
      },
    };
  }, {});

  return logsGroupedByHour;
};

const getUpdatedLogsGroupedByHour = ({
  previousLogsGroupedByHour,
  logs,
}: {
  previousLogsGroupedByHour: LogsGroupedByHour;
  logs: LogLine[];
}) => {
  const newLogsGroupedByHour = getLogsGroupedByHour(logs);

  return Object.keys(newLogsGroupedByHour).reduce(
    (logsGroupedByHour, logHourGroup) => {
      const previousLogs = logsGroupedByHour?.[logHourGroup] || {
        numberOfSuccessResponses: 0,
        numberOfFailedResponses: 0,
      };
      const newLogs = newLogsGroupedByHour[logHourGroup];

      return {
        ...logsGroupedByHour,
        [logHourGroup]: {
          numberOfSuccessResponses:
            previousLogs.numberOfSuccessResponses +
            newLogs.numberOfSuccessResponses,
          numberOfFailedResponses:
            previousLogs.numberOfFailedResponses +
            newLogs.numberOfFailedResponses,
        },
      };
    },
    previousLogsGroupedByHour
  );
};

const createDashboard = async (flags: CLIFlags) => {
  const screen = blessed.screen();
  const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

  let healthCheckLogs: LogLine[] = [];
  let healthCheckLogsGroupedByHour: LogsGroupedByHour;

  const healthCheckLogsStream = flags.mock
    ? mockReadHealthCheckLogsStream()
    : readHealthCheckLogsStream(flags.server);

  healthCheckLogsStream.on("data", (buffer) => {
    const logs = JSON.parse(buffer.toString()) || [];

    healthCheckLogs = [...healthCheckLogs, ...logs];

    healthCheckLogsGroupedByHour = getUpdatedLogsGroupedByHour({
      previousLogsGroupedByHour: healthCheckLogsGroupedByHour,
      logs,
    });

    const chartArgs = {
      grid,
      logsGroupedByHour: healthCheckLogsGroupedByHour,
      logs: healthCheckLogs,
    };

    const serverResponsesChart = createServerResponsesChart(chartArgs);
    const successPercentageChart = createSuccessPercentageChart(chartArgs);
    const averageRequestTimeChart = createAverageRequestTimeChart(chartArgs);
    const serverStatusChart = createServerStatusChart(chartArgs);

    screen.on("resize", function () {
      serverResponsesChart.emit("attach");
      successPercentageChart.emit("attach");
      averageRequestTimeChart.emit("attach");
      serverStatusChart.emit("attach");
    });

    screen.render();
  });

  screen.key(["escape", "q", "C-c"], function (ch, key) {
    return process.exit(0);
  });
};

export { createDashboard };
