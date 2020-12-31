import contrib from "blessed-contrib";
import { ChartArgs } from "../../../types/types";

const createServerResponsesChart = ({ grid, logsGroupedByHour }: ChartArgs) => {
  const logHours = Object.keys(logsGroupedByHour);
  const logs = Object.values(logsGroupedByHour);

  const serverResponsesChart = grid.set(0, 0, 6, 12, contrib.line, {
    maxY: 100,
    showLegend: true,
    label: "Responses",
    style: {
      baseline: "white",
    },
    border: {
      type: "line",
    },
  });

  const successfulResponses = {
    title: "Successful",
    x: logHours,
    y: logs.map((log) => log.numberOfSuccessResponses),
    style: {
      line: "green",
    },
  };
  const failedResponses = {
    title: "Failed",
    x: logHours,
    y: logs.map((log) => log.numberOfFailedResponses),
    style: {
      line: "red",
    },
  };

  serverResponsesChart.setData([successfulResponses, failedResponses]);

  return serverResponsesChart;
};

export { createServerResponsesChart };
