import { LogLine, LogsGroupedByHour, ResponseType } from "../types/types";

const getLogLineWithDiffDate = (logLine: LogLine, date: string): LogLine => ({
  ...logLine,
  date,
});

const SingleLogLineMock: {
  [K in ResponseType]: LogLine;
} = {
  [ResponseType.SUCCESSFUL]: {
    date: "2020-12-31T11:00:43.284Z",
    responseStatus: 200,
    requestTime: 10,
    responseType: ResponseType.SUCCESSFUL,
  },
  [ResponseType.FAILED]: {
    date: "2020-12-31T11:00:43.284Z",
    responseStatus: 500,
    requestTime: 4,
    responseType: ResponseType.FAILED,
  },
  [ResponseType.SERVER_UNREACHABLE]: {
    date: "2020-12-31T11:00:43.284Z",
    responseStatus: null,
    requestTime: null,
    responseType: ResponseType.SERVER_UNREACHABLE,
  },
};

const MixedLogLinesMock = [
  // 12:00
  SingleLogLineMock[ResponseType.SUCCESSFUL],
  SingleLogLineMock[ResponseType.FAILED],
  SingleLogLineMock[ResponseType.FAILED],
  // 12:30
  getLogLineWithDiffDate(
    SingleLogLineMock[ResponseType.SERVER_UNREACHABLE],
    "2020-12-31T11:30:43.284Z"
  ),
  getLogLineWithDiffDate(
    SingleLogLineMock[ResponseType.SUCCESSFUL],
    "2020-12-31T11:30:43.284Z"
  ),
  getLogLineWithDiffDate(
    SingleLogLineMock[ResponseType.SUCCESSFUL],
    "2020-12-31T11:30:43.284Z"
  ),
  // 13:00
  getLogLineWithDiffDate(
    SingleLogLineMock[ResponseType.SERVER_UNREACHABLE],
    "2020-12-31T12:00:43.284Z"
  ),
  getLogLineWithDiffDate(
    SingleLogLineMock[ResponseType.SUCCESSFUL],
    "2020-12-31T12:00:43.284Z"
  ),
];

const LogsGroupedByHourMock: LogsGroupedByHour = {
  "12:00": {
    numberOfSuccessResponses: 1,
    numberOfFailedResponses: 2,
  },
  "12:30": {
    numberOfSuccessResponses: 2,
    numberOfFailedResponses: 1,
  },
  "13:00": {
    numberOfSuccessResponses: 1,
    numberOfFailedResponses: 1,
  },
};

export { SingleLogLineMock, MixedLogLinesMock, LogsGroupedByHourMock };
