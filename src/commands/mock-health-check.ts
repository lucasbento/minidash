import { Readable } from "stream";
import { LogLine, ResponseType } from "../types/types";
import { SingleLogLineMock } from "../__mocks__/logs";

const mockReadHealthCheckLogsStream = () => {
  const stream = new Readable({
    read() {
      return true;
    },
  });

  let logsGenerated = 0;
  let lastLog: LogLine | undefined = undefined;

  const interval = setInterval(() => {
    let date = new Date();
    const shouldHave30Minutes = Math.random() < 0.5;
    const shouldSucceed = Math.random() < 0.7;

    if (!lastLog) {
      date.setHours(date.getSeconds() % 3);
      date.setMinutes(shouldHave30Minutes ? 30 : 0);
    } else {
      date.setHours(new Date(lastLog.date).getHours() + 1);
      date.setMinutes(new Date(lastLog.date).getMinutes());
    }

    const log =
      SingleLogLineMock[
        shouldSucceed ? ResponseType.SUCCESSFUL : ResponseType.FAILED
      ];

    stream.push(
      Buffer.from(
        JSON.stringify([
          {
            ...log,
            date,
          },
        ])
      )
    );

    logsGenerated++;

    if (logsGenerated === 100) {
      lastLog = log;
    }
  }, 500);

  process.on("SIGINT", () => clearInterval(interval));

  return stream;
};

export { mockReadHealthCheckLogsStream };
