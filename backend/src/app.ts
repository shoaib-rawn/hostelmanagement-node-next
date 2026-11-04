import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { healthRouter } from "./routes/health.routes";
export const app = express();
app.use(express.json());
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${Date.now() - start}ms`,
    );
  });
  next();
});

app.use("/health", healthRouter);
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});
