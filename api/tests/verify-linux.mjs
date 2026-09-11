// Linux staging helper. Never migrates or tests against the configured live database.
// Run from api: node tests/verify-linux.mjs /absolute/path/to/live/api/.env
import { config } from "dotenv";
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import assert from "node:assert/strict";

assert.equal(process.platform, "linux");
assert.ok(process.argv[2]?.startsWith("/"), "Supply an absolute API .env path");
config({ path: process.argv[2], quiet: true });
const url = new URL(process.env.DATABASE_URL);
assert.ok(["localhost", "127.0.0.1"].includes(url.hostname), "This helper requires local PostgreSQL");
const database = `dwell_verify_${Date.now()}_${randomBytes(3).toString("hex")}`;
const owner = decodeURIComponent(url.username);
assert.match(owner, /^[a-zA-Z_][a-zA-Z0-9_]*$/);
url.pathname = `/${database}`;
const env = { ...process.env, DATABASE_URL: url.href, NODE_ENV: "test", JWT_SECRET: randomBytes(32).toString("hex") };
execFileSync("runuser", ["-u", "postgres", "--", "createdb", "--owner", owner, database]);
try {
  execFileSync(process.execPath, ["node_modules/prisma/build/index.js", "migrate", "deploy"], { env, stdio: "inherit" });
  execFileSync(process.execPath, ["tests/integration.mjs"], { env, stdio: "inherit" });
} finally {
  // Exact database name generated above; never accepts a live name from input.
  execFileSync("runuser", ["-u", "postgres", "--", "dropdb", database]);
  console.log("Disposable verification database removed.");
}
