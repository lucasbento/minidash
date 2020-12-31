import blessed from "blessed";
import { ChartArgs, ResponseType } from "../../../types/types";

interface ServerStatus {
  [key: string]: {
    label: string;
    color: string;
  };
}

const SERVER_STATUS: ServerStatus = {
  [ResponseType.SUCCESSFUL]: {
    label: "UP!",
    color: "green",
  },
  [ResponseType.SERVER_UNREACHABLE]: {
    label: "UNREACHABLE!",
    color: "red",
  },
};

const getServerStatus = (logs: ChartArgs["logs"]) => {
  const lastLog = [...logs].splice(-1)[0];

  // If the last log is `FAILED`, check the last 5 logs for
  // response type as `SERVER_UNREACHABLE` or `FAILED`
  if (lastLog.responseType === ResponseType.FAILED) {
    const lastFiveLogs = [...logs].splice(-5);

    const allLogsAreFailedResponses = lastFiveLogs.every((log) =>
      [ResponseType.FAILED, ResponseType.SERVER_UNREACHABLE].includes(
        log.responseType
      )
    );

    if (allLogsAreFailedResponses) {
      return SERVER_STATUS[ResponseType.SERVER_UNREACHABLE];
    }

    // If they are not then just consider the server as "UP"

    return SERVER_STATUS[ResponseType.SUCCESSFUL];
  }

  // Server status will either be `Successful` or `Unreachable`
  return (
    SERVER_STATUS[lastLog.responseType] ||
    SERVER_STATUS[ResponseType.SERVER_UNREACHABLE]
  );
};

const createServerStatusChart = ({ grid, logs }: ChartArgs) => {
  const serverStatus = getServerStatus(logs);

  const serverStatusChart = grid.set(6.5, 8, 2, 4.15, blessed.box, {
    content: `\n{center}{bold}{${serverStatus.color}-fg}${serverStatus.label}{/${serverStatus.color}-fg}{/bold}{/center}`,
    tags: true,
    label: "Server status",
    border: {
      type: "line",
    },
    style: {
      fg: "blue",
      baseline: "white",
    },
  });

  return serverStatusChart;
};

export { createServerStatusChart };
