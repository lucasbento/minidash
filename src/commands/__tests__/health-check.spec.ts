import fetch from "node-fetch";
import { mocked } from "ts-jest/utils";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import {
  runHealthCheckProcess,
  LOG_FOLDER,
  getFileName,
  readHealthCheckLogsStream,
} from "../health-check";
import { ResponseType } from "../../types/types";
import { MixedLogLinesMock, SingleLogLineMock } from "../../__mocks__/logs";
import { SERVER_URL } from "../../__mocks__/cli";

jest.mock("node-fetch", () =>
  jest.fn().mockReturnValue(
    Promise.resolve({
      ok: true,
      status: 200,
    })
  )
);

jest.mock("fs", () => ({
  watch: jest.fn().mockImplementation((f, callback) => {
    callback();

    return {
      on: jest.fn(),
    };
  }),
  createReadStream: jest.fn().mockReturnValue({
    on: jest.fn().mockImplementation((e, callback) => {
      callback(Buffer.from(JSON.stringify(MixedLogLinesMock)));
    }),
  }),
  promises: {
    mkdir: jest.fn(),
    appendFile: jest.fn(),
  },
}));

jest.mock("stream", () => ({
  Readable: jest.fn(),
}));

jest.mock("nthline", () =>
  jest
    .fn()
    .mockImplementation(() =>
      Promise.resolve(JSON.stringify(SingleLogLineMock.SUCCESSFUL))
    )
);

const mockedFetch = mocked(fetch, true) as jest.MockInstance<any, any>;
const mockedReadable = mocked(Readable, true) as jest.MockInstance<any, any>;

window.setInterval = jest.fn();

const logFile = path.join(LOG_FOLDER, getFileName(SERVER_URL));

describe("runHealthCheckProcess", () => {
  it("should start health check process", async () => {
    await runHealthCheckProcess({
      server: SERVER_URL,
      dashboardOnly: false,
      healthCheckOnly: false,
      mock: false,
    });

    expect(setInterval).toHaveBeenCalledTimes(1);
  });

  it("should start health check process", async () => {
    expect(mockedFetch).toHaveBeenCalledTimes(1);
  });

  it("should create the log folder", async () => {
    expect(fs.promises.mkdir).toHaveBeenCalledTimes(1);
    expect(fs.promises.mkdir).toHaveBeenCalledWith(LOG_FOLDER);
  });

  it("should write a new log line", async () => {
    expect(fs.promises.appendFile).toHaveBeenCalledTimes(1);
    expect(fs.promises.appendFile).toHaveBeenCalledWith(
      logFile,
      expect.stringContaining(ResponseType.SUCCESSFUL),
      {
        flag: "a",
      }
    );
  });

  it("should create a log when the server is unreachable", async () => {
    mockedFetch.mockImplementation(() => {
      throw {
        code: "ECONNREFUSED",
      };
    });

    await runHealthCheckProcess({
      server: SERVER_URL,
      dashboardOnly: false,
      healthCheckOnly: false,
      mock: false,
    });

    expect(fs.promises.appendFile).toHaveBeenCalledWith(
      logFile,
      expect.stringContaining(ResponseType.SERVER_UNREACHABLE),
      {
        flag: "a",
      }
    );
  });
});

describe("readHealthCheckLogsStream", () => {
  const streamPushMock = jest.fn();
  mockedReadable.mockReturnValue({
    push: streamPushMock,
  });

  it("should start initial health check logs stream", () => {
    readHealthCheckLogsStream(SERVER_URL);

    expect(fs.createReadStream).toHaveBeenCalledTimes(1);
    expect(fs.createReadStream).toHaveBeenCalledWith(logFile);

    expect(streamPushMock).toHaveBeenCalled();
  });

  it("should start continuous health check logs stream", () => {
    expect(fs.watch).toHaveBeenCalledTimes(1);
    expect(fs.watch).toHaveBeenCalledWith(logFile, expect.anything());

    expect(streamPushMock).toHaveBeenCalled();
  });
});
