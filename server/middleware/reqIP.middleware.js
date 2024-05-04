import { createMiddleware } from "hono/factory";

const requestIP = createMiddleware(async (c, next) => {
  let ip =
    c.req.raw.headers.get("x-forwarded-for") ||
    c.req.raw.headers.get("CF-Connecting-IP");
  if (!ip) {
    ip = c.env.ip.address.substr(7);
  }
  c.set("ip_address", ip);
  await next();
});

export default requestIP;
