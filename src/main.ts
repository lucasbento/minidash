import meow from "meow";
import { createDashboard } from "./commands/dashboard/dashboard";
import { runHealthCheckProcess } from "./commands/health-check";
import { CLIFlags } from "./types/types";

const cli = meow(
  `
	Usage
	  $ minidash --server <url> <options>

  Options
    --dashboard-only     Only show the dashboard with the already-stored logs.
    --health-check-only  Start the health check process without showing the dashboard.
    --mock               Show the dashboard with mock data (for showcase purposes)

	Examples
	  $ minidash --server https://google.com/
`,
  {
    flags: {
      server: {
        type: "string",
        isRequired: true,
      },
      dashboardOnly: {
        type: "boolean",
      },
      healthCheckOnly: {
        type: "boolean",
      },
      mock: {
        type: "boolean",
      },
    },
  }
);

if (!cli.flags.dashboardOnly) {
  runHealthCheckProcess(cli.flags as CLIFlags);
}

if (!cli.flags.healthCheckOnly) {
  createDashboard(cli.flags as CLIFlags);
}
