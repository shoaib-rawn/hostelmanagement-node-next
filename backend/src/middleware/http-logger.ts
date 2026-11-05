import { randomUUID } from "node:crypto";
import { pinoHttp } from "pino-http";
import { logger } from "../lib/logger";

export const httpLogger = pinoHttp({
  logger,
  genReqId: (req, res) => {
    const incoming = req.headers["x-request-id"];
    const id =
      typeof incoming === "string" && incoming ? incoming : randomUUID();
    res.setHeader("x-request-id", id);
    return id;
  },
});
