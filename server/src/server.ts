import app from "./app";
import connectDB from "./lib/mongoose";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { startStorageReclaimWatcher } from "./jobs/storageReclaim";

connectDB()
  .then(() => {
    startStorageReclaimWatcher();

    const PORT = env.PORT;
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error("Failed to start server due to DB connection error", { err });
    process.exit(1);
  });
