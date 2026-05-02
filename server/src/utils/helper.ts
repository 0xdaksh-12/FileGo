import { BadRequestError } from "./errorHandler";

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function parseUploadOptions(expiry?: string): Date | null {
  let expiresAt: Date | null = null;

  if (expiry && expiry !== "never") {
    const now = new Date();
    switch (expiry) {
      case "1h":
        expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
        break;
      case "1d":
        expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      case "7d":
        expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        throw new BadRequestError("Invalid expiry value");
    }
  }

  return expiresAt;
}
