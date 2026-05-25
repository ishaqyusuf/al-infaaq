import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");
const workspaceDir = process.cwd();

function mergeEnvFile(filePath, targetEnv) {
  if (!existsSync(filePath)) {
    return;
  }

  const parsed = parseEnv(readFileSync(filePath, "utf8"));

  for (const [key, value] of Object.entries(parsed)) {
    targetEnv[key] = value;
  }
}

function buildEnv() {
  const env = { ...process.env };
  const rootEnvFiles = [".env", ".env.development", ".env.local"].map((file) =>
    path.join(repoRoot, file),
  );
  const workspaceEnvFiles = [".env", ".env.development", ".env.local"].map(
    (file) => path.join(workspaceDir, file),
  );

  for (const filePath of rootEnvFiles) {
    mergeEnvFile(filePath, env);
  }

  if (workspaceDir !== repoRoot) {
    for (const filePath of workspaceEnvFiles) {
      mergeEnvFile(filePath, env);
    }
  }

  return env;
}

function parseCommand(argv) {
  const envAssignments = {};
  let index = 0;

  while (index < argv.length) {
    const token = argv[index];

    if (!/^[A-Za-z_][A-Za-z0-9_]*=/.test(token)) {
      break;
    }

    const separatorIndex = token.indexOf("=");
    envAssignments[token.slice(0, separatorIndex)] = token.slice(
      separatorIndex + 1,
    );
    index += 1;
  }

  const command = argv[index];
  const args = argv.slice(index + 1);

  if (!command) {
    console.error("Expected a command to run.");
    process.exit(1);
  }

  return { args, command, envAssignments };
}

const { args, command, envAssignments } = parseCommand(process.argv.slice(2));
const child = spawn(command, args, {
  cwd: workspaceDir,
  env: { ...buildEnv(), ...envAssignments },
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
