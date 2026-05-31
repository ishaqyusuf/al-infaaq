import { type ChildProcess, spawn } from "node:child_process";

const apiProcess: ChildProcess = spawn(
  "bun",
  ["--cwd", "apps/api", "src/index.ts"],
  {
    env: process.env,
    stdio: "inherit",
  },
);

function stop(signal: NodeJS.Signals) {
  apiProcess.kill(signal);
}

process.on("SIGINT", () => stop("SIGINT"));
process.on("SIGTERM", () => stop("SIGTERM"));

apiProcess.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

apiProcess.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
