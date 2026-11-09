import express from "express";
import { errorHandler } from "./middleware/error-handler";
import { httpLogger } from "./middleware/http-logger";
import { notFoundHandler } from "./middleware/not-found";
//import { echoRouter } from "./routes/echo.routes";
import { healthRouter } from "./routes/health.routes";
import { authRouter } from "./routes/auth.routes";
import { memberRouter } from "./routes/member.routes";
export const app = express();

app.disable("x-powered-by");

app.use(httpLogger);
app.use(express.json());

app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/members", memberRouter);
app.use(notFoundHandler);
app.use(errorHandler);
