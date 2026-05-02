import mongoose from "mongoose";
import File from "../models/file.model";
import { updateUserStorage } from "../services/userService";
import { logger } from "../utils/logger";

/**
 * INT-3: Watch for TTL-expired file deletions via MongoDB Change Stream.
 * When MongoDB auto-removes a document (via the expiresAt TTL index), the
 * user's storageBytes counter must be decremented to prevent indefinite drift.
 *
 * This watcher is started alongside the server and requires a replica set
 * (already required for transactions).
 */
export function startStorageReclaimWatcher(): void {
  const pipeline = [{ $match: { operationType: "delete" } }];

  const changeStream = File.watch(pipeline, { fullDocumentBeforeChange: "required" });

  changeStream.on("change", async (change: any) => {
    const doc = change.fullDocumentBeforeChange;

    // Only handle TTL-triggered deletes (isActive: true means it wasn't
    // soft-deleted by the user — which already decrements storageBytes)
    if (!doc || !doc.isActive) return;

    try {
      await updateUserStorage(doc.uploader.toString(), -doc.size);
      logger.info("Storage reclaimed for TTL-expired file", {
        uuid: doc.uuid,
        userId: doc.uploader,
        bytes: -doc.size,
      });
    } catch (err) {
      logger.error("Failed to reclaim storage after TTL expiry", {
        uuid: doc.uuid,
        err,
      });
    }
  });

  changeStream.on("error", (err) => {
    logger.error("Storage reclaim watcher error", { err });
  });

  logger.info("Storage reclaim watcher started");
}
