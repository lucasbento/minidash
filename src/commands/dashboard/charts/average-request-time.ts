import contrib from "blessed-contrib";
import { ChartArgs, ResponseType } from "../../../types/types";

const createAverageRequestTimeChart = ({ grid, logs }: ChartArgs) => {
  // Get all the logs except the `SERVER_UNREACHABLE` ones
  const lastLogs = [...logs]
    .filter((log) => log.responseType !== ResponseType.SERVER_UNREACHABLE)
    .splice(-40);

  // Sum up all the log's `requestTime`
  const totalRequestTime = lastLogs.reduce(
    (total, log) => total + (log.requestTime || 0),
    0
  );
  // Calculate the average
  const averageTime = Math.round(totalRequestTime / lastLogs.length);

  const averageRequestTime = grid.set(6.5, 3, 3, 5, contrib.sparkline, {
    showLegend: true,
    label: "Response time",
    tags: true,
    border: {
      type: "line",
    },
    style: { fg: "blue", baseline: "white" },
  });

  averageRequestTime.setData(
    [`Average ${averageTime}ms`],
    // @ts-ignore - yaronn/blessed-contrib#206
    [lastLogs.map((log) => log.requestTime)]
  );

  return averageRequestTime;
};

export { createAverageRequestTimeChart };
