import contrib from "blessed-contrib";
import closestNumber from "closest-number";
import { ChartArgs } from "../../../types/types";

type HealthPercentages = 90 | 80 | 60 | 50 | 30 | 20;

type ServerHealth = {
  [Key in HealthPercentages]: {
    title: string;
    color: "green" | "yellow" | "red";
  };
};

const SERVER_HEALTH: ServerHealth = {
  90: {
    title: "Excellent",
    color: "green",
  },
  80: {
    title: "Good",
    color: "green",
  },
  60: {
    title: "Satisfactory",
    color: "yellow",
  },
  50: {
    title: "Bad",
    color: "red",
  },
  30: {
    title: "Poor",
    color: "red",
  },
  20: {
    title: "Unacceptable",
    color: "red",
  },
};

const getPercentageOfSuccessResponses = (
  logs: ChartArgs["logsGroupedByHour"]
): number => {
  const { numberOfSuccessResponses, numberOfFailedResponses } = Object.values(
    logs
  ).reduce(
    (total, log) => ({
      numberOfSuccessResponses:
        total.numberOfSuccessResponses + log.numberOfSuccessResponses,
      numberOfFailedResponses:
        total.numberOfFailedResponses + log.numberOfFailedResponses,
    }),
    {
      numberOfSuccessResponses: 0,
      numberOfFailedResponses: 0,
    }
  );
  const totalOfResponses = numberOfSuccessResponses + numberOfFailedResponses;

  return Math.round((numberOfSuccessResponses * 100) / totalOfResponses);
};

const getServerHealth = (percentageOfSuccessResponses: number) => {
  // Create an array with all the server health statuses
  // that are <= than the `percentageOfSuccessResponses`
  const healthTypePercentages = Object.keys(SERVER_HEALTH).filter(
    (percentage) => parseInt(percentage) <= percentageOfSuccessResponses
  );

  // If the array is empty then return the lowest server health status
  if (healthTypePercentages.length === 0) {
    return SERVER_HEALTH[20];
  }

  // If not then get the closest server health status
  // to `percentageOfSuccessResponses`
  const healthTypePercentage: HealthPercentages = closestNumber(
    healthTypePercentages,
    percentageOfSuccessResponses
  );

  return SERVER_HEALTH[healthTypePercentage];
};

const createSuccessPercentageChart = ({
  grid,
  logsGroupedByHour,
}: ChartArgs) => {
  const percentageOfSuccessResponses = getPercentageOfSuccessResponses(
    logsGroupedByHour
  );
  const health = getServerHealth(percentageOfSuccessResponses);

  const donut = grid.set(6.5, 0, 6, 3, contrib.donut, {
    label: "Server health",
    radius: 15,
    arcWidth: 2,
    remainColor: "black",
  });

  donut.setData([
    {
      percent: percentageOfSuccessResponses.toString(),
      label: health.title,
      color: health.color,
    },
  ]);

  return donut;
};

export { SERVER_HEALTH, createSuccessPercentageChart };
