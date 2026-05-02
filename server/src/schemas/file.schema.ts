import { z } from "zod";

export const uploadUrlSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    type: z.string().min(1),
    size: z
      .number()
      .positive()
      .max(2 * 1024 * 1024 * 1024, "Max file size is 2GB"),
    expiresAt: z.enum(["1h", "1d", "7d", "30d", "never"]).optional(),
    password: z.string().min(6, "Password must be at least 6 characters").optional(),
  }),
});

export const downloadFileSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z
    .object({
      password: z.string().optional(),
    })
    .optional(),
});
