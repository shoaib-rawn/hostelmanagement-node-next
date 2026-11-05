import { Router } from "express";
import { z } from "zod";
import { AppError } from "../lib/errors";
import { validateBody } from "../middleware/validate";

export const echoRouter = Router();

const echoSchema = z.object({
  name: z.string().min(2),
  age: z.coerce.number().int().min(18),
});

echoRouter.post("/", validateBody(echoSchema), (req, res) => {
  res.json({ received: req.body });
});

echoRouter.get("/forbidden", () => {
  throw new AppError(403, "Aap ko ijazat nahi hai", "FORBIDDEN");
});

echoRouter.get("/crash", () => {
  throw new Error("secret internal detail");
});
