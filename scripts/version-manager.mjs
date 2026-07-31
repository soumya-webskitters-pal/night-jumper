import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const packagePath = resolve(projectRoot, "package.json");
const lockPath = resolve(projectRoot, "package-lock.json");
const historyPath = resolve(projectRoot, "VERSION_HISTORY.md");

function nextVersion(version, type) {
  const [major, minor] = version.split(".").map(Number);
  return type === "major"
    ? `${major + 1}.0.0`
    : `${major}.${minor + 1}.0`;
}

function stagedFiles() {
  return execFileSync(
    "git",
    ["diff", "--cached", "--name-only", "--diff-filter=ACMRD"],
    { cwd: projectRoot, encoding: "utf8" },
  )
    .trim()
    .split("\n")
    .filter(Boolean)
    .filter((file) => !["package.json", "package-lock.json", "VERSION_HISTORY.md"].includes(file));
}

const packageData = JSON.parse(readFileSync(packagePath, "utf8"));
const statusOnly = process.argv.includes("--status");

if (statusOnly) {
  console.log(`Current: ${packageData.version}`);
  console.log(`Next minor: ${nextVersion(packageData.version, "minor")}`);
  console.log(`Next major: ${nextVersion(packageData.version, "major")}`);
  process.exit(0);
}

const type = process.argv[2] || "minor";
if (!["minor", "major"].includes(type)) {
  console.error('Version type must be "minor" or "major".');
  process.exit(1);
}

const files = stagedFiles();
if (!files.length) process.exit(0);

const version = nextVersion(packageData.version, type);
const lockData = JSON.parse(readFileSync(lockPath, "utf8"));

packageData.version = version;
lockData.version = version;
lockData.packages[""].version = version;

writeFileSync(packagePath, `${JSON.stringify(packageData, null, 2)}\n`);
writeFileSync(lockPath, `${JSON.stringify(lockData, null, 2)}\n`);

let history;
try {
  history = readFileSync(historyPath, "utf8").trimEnd();
} catch {
  history = "# Version History\n";
}

const date = new Date().toISOString();
const entry = [
  "",
  `## v${version} — ${date}`,
  "",
  `Type: ${type}`,
  "",
  "Changed files:",
  ...files.map((file) => `- \`${file}\``),
  "",
].join("\n");

writeFileSync(historyPath, `${history}${entry}`);
execFileSync(
  "git",
  ["add", "package.json", "package-lock.json", "VERSION_HISTORY.md"],
  { cwd: projectRoot },
);

console.log(`Version ${packageData.version} (${type}) logged.`);
