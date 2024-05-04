import { rateLimiter } from "hono-rate-limiter";
import ms from "ms";

const limiter = rateLimiter({
  windowMs: ms("5m"), // 5 minutes
  limit: 10, // limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again in a while",
  },
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  keyGenerator: (c) => c.var.ip_address,
});

export default limiter;
