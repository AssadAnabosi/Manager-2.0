import { createMiddleware } from "hono/factory";
import { allowedOrigins } from "../config/cors.config.js";

const allowCredentials = createMiddleware(async (c, next) => {
  const origin = c.req.header("origin");
  if (allowedOrigins.includes(origin)) {
    c.res.headers.append("Access-Control-Allow-Credentials", true);
  }

  await next();
});

export default allowCredentials;
