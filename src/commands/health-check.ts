import path from "path";
import fetch from "node-fetch";
import format from "date-fns/format";
import nthline from "nthline";
import { Readable } from "stream";
import fs from "fs";
import { fromUrl, parseDomain, ParseResultType } from "parse-domain";
import { CLIFlags, LogLine, ResponseType } from "../types/types";

const LOG_FOLDER = path.join(__dirname, "../../logs");
const SUCCESS_STATUSES = [200];

let healthCheckProcess: NodeJS.Timeout;

const getFileName = (server: string) =>
  `${server}-` + format(new Date(), "yyyy-MM-dd") + ".log";

const parseLogs = (logs: string[]): LogLine[] => {
  const cleanLogs = logs
    // Add `,` to mimic an object
    .join(",");

  return JSON.parse(`[${cleanLogs}]`);
};

const startContinuousReadHealthCheckStream = ({
  logFile,
  stream,
  lineToStartAt,
}: {
  logFile: string;
  stream: Readable;
  lineToStartAt: number;
}) => {
  let lineToRead = lineToStartAt;

  const logFileWatcher = fs.watch(logFile, async () => {
    try {
      const logLineAdded = await nthline(lineToRead, logFile);
      const parsedLogs = parseLogs([logLineAdded]);

      stream.push(Buffer.from(JSON.stringify(parsedLogs)));

      lineToRead++;
    } catch (_error) {}
  });

  logFileWatcher.on("close", () => stream.push(null));
  process.on("SIGINT", () => logFileWatcher.close());
};

const readInitialHealthCheckLogs = ({
  logFile,
  stream,
}: {
  logFile: string;
  stream: Readable;
}) => {
  const initialReadStream = fs.createReadStream(logFile);

  const initialReadStreamChunks: Buffer[] = [];

  initialReadStream.on("data", (chunk: Buffer) => {
    initialReadStreamChunks.push(chunk);
  });

  initialReadStream.on("close", () => {
    const healthCheckLogs = initialReadStreamChunks.reduce(
      (allLogs, chunk) => allLogs + chunk.toString(),
      ""
    );

    // Remove line breaks and transform into an array
    const logsAsArray = healthCheckLogs.trim().split("\n");
    const parsedLogs = parseLogs(logsAsArray);

    stream.push(Buffer.from(JSON.stringify(parsedLogs)));

    startContinuousReadHealthCheckStream({
      logFile,
      stream,
      lineToStartAt: parsedLogs.length,
    });
  });

  initialReadStream.on("error", (err: Error & { code: string }) => {
    // If the log file doesn't exist yet then wait 500 ms and retry
    if (err.code === "ENOENT") {
      setTimeout(() => {
        initialReadStream.close();

        readInitialHealthCheckLogs({
          logFile,
          stream,
        });
      }, 500);
    }
  });
};

const readHealthCheckLogsStream = (server: CLIFlags["server"]): Readable => {
  const parsedServerURL = getParsedServerURL(server);

  const stream = new Readable({
    read() {
      return true;
    },
  });
  const fileName = getFileName(parsedServerURL);
  const logFile = path.join(LOG_FOLDER, fileName);

  readInitialHealthCheckLogs({ logFile, stream });

  return stream;
};

const createLogFolder = async () => {
  try {
    // Attempt to create `./logs` folder
    await fs.promises.mkdir(LOG_FOLDER);
  } catch (err) {
    // Only throw error if the folder does not exist even after
    // attempting to create it
    if (err.code !== "EEXIST") {
      throw err;
    }
  }
};

const getLogLine = ({
  responseStatus,
  requestTime,
  responseType,
}: {
  responseStatus?: number;
  requestTime?: number;
  responseType: ResponseType;
}): string => {
  const date = new Date().toISOString();
  const logLine: LogLine = {
    date,
    responseStatus: responseStatus ?? null,
    requestTime: requestTime ?? null,
    responseType,
  };

  return JSON.stringify(logLine) + "\n";
};

const getResponseType = ({
  responseStatus,
  responseType,
}: {
  responseStatus?: number;
  responseType?: ResponseType;
}) => {
  if (responseType) {
    return responseType;
  }

  if (!responseStatus || !SUCCESS_STATUSES.includes(responseStatus)) {
    return ResponseType.FAILED;
  }

  return ResponseType.SUCCESSFUL;
};

const getParsedServerURL = (server: CLIFlags["server"]) => {
  const parseResult = parseDomain(fromUrl(server));

  if (
    parseResult.type === ParseResultType.Reserved &&
    parseResult.hostname === "localhost"
  ) {
    return fromUrl(server) as string;
  }

  if (parseResult.type === ParseResultType.Listed) {
    const { subDomains, domain, topLevelDomains } = parseResult;

    return `${subDomains}.${domain}.${topLevelDomains}`.replace(/^\./, "");
  }

  throw new Error("Invalid server URL");
};

const writeLogLine = async ({
  server,
  responseStatus,
  requestTime,
  responseType,
}: {
  server: string;
  responseStatus?: number;
  requestTime?: number;
  responseType?: ResponseType;
}) => {
  await createLogFolder();

  const fileName = getFileName(server);
  const logFile = path.join(LOG_FOLDER, fileName);

  const responseTypeToWrite = getResponseType({ responseStatus, responseType });

  try {
    await fs.promises.appendFile(
      logFile,
      getLogLine({
        responseStatus,
        requestTime,
        responseType: responseTypeToWrite,
      }),
      {
        flag: "a",
      }
    );
  } catch (_error) {}
};

const runHealthCheckProcess = async (flags: CLIFlags) => {
  if (!healthCheckProcess) {
    healthCheckProcess = setInterval(() => runHealthCheckProcess(flags), 5000);

    // Make sure to clear the interval when process exits
    process.on("SIGINT", () => {
      clearInterval(healthCheckProcess);
    });
  }

  const parsedServerURL = getParsedServerURL(flags.server);

  try {
    const requestStartTime = new Date();

    const { status: responseStatus } = await fetch(flags.server);

    const requestEndTime = new Date();

    const requestTime = +requestEndTime - +requestStartTime;

    try {
      await writeLogLine({
        server: parsedServerURL,
        responseStatus,
        requestTime,
      });
    } catch (_error) {}
  } catch (err) {
    // Check if the error is because it can't reach the server
    if (err.code === "ECONNREFUSED") {
      await writeLogLine({
        server: parsedServerURL,
        responseType: ResponseType.SERVER_UNREACHABLE,
      });
    }
  }
};

export {
  runHealthCheckProcess,
  readHealthCheckLogsStream,
  LOG_FOLDER,
  getFileName,
  getLogLine,
};
