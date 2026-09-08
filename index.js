import app from "./app.js";
import { startDiscordBot } from "./discord-bot.js";
import { logger } from "./lib/logger.js";

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = app.listen(port, () => {
  logger.info({ port }, "Server listening");

  startDiscordBot().catch((error) => {
    logger.error({ err: error }, "Discord bot failed to start");
    process.exitCode = 1;
  });
});

server.on("error", (error) => {
  logger.error({ err: error }, "Error listening on port");
  process.exit(1);
});
