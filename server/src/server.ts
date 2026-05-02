import app from "./app";
import connectDB from "./lib/mongoose";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { startStorageReclaimWatcher } from "./jobs/storageReclaim";
import axios from "axios";

/**
 * Better Stack Uptime Heartbeat
 * Pings the heartbeat URL every minute if configured.
 */
function startHeartbeat() {
  if (!env.BETTER_STACK_UPTIME_URL) return;

  const ping = async () => {
    try {
      await axios.get(env.BETTER_STACK_UPTIME_URL);
    } catch (err) {
      logger.error("Heartbeat ping failed", { err });
    }
  };

  // Initial ping and then every 60 seconds
  ping();
  setInterval(ping, 60000);
  logger.info("Better Stack Heartbeat started");
}

connectDB().then(() => {
  startStorageReclaimWatcher();
  startHeartbeat();
});

const PORT = env.PORT;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
