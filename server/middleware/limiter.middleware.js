import rateLimit from "express-rate-limit";
import ResponseError from "../utils/responseError.js";
import ms from "ms";

const limiter = rateLimit({
  windowMs: ms("5m"), // 5 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    message: "Too many requests from this IP, please try again in a while",
  },
  handler: (req, res, next, options) => {
    console.log(`🚩  [${req.ip_address}] has been rate limited`);
    throw new ResponseError(options.message.message, options.statusCode);
  },
});

export default limiter;
