import { grid } from "blessed-contrib";

export interface CLIFlags {
  server: string;
  dashboardOnly: boolean;
  healthCheckOnly: boolean;
  mock: boolean;
}

export enum ResponseType {
  SUCCESSFUL = "SUCCESSFUL",
  FAILED = "FAILED",
  SERVER_UNREACHABLE = "SERVER_UNREACHABLE",
}

export interface LogLine {
  date: string;
  responseStatus: number | null;
  requestTime: number | null;
  responseType: ResponseType;
}

export interface LogsGroupedByHour {
  [H: string]: {
    numberOfSuccessResponses: number;
    numberOfFailedResponses: number;
  };
}

export interface ChartArgs {
  grid: grid;
  logsGroupedByHour: LogsGroupedByHour;
  logs: LogLine[];
}
