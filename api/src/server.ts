import { createServer } from "node:http";
import { createApp } from "./app.js";
import { config } from "./config.js";
import { prisma } from "./db.js";

const server = createServer(createApp());

server.listen(config.PORT, () => {
  console.log(`Dwell API listening on http://localhost:${config.PORT}`);
});

async function shutdown(signal: string) {
  console.log(`${signal} received; shutting down`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
