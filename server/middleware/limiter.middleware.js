import rateLimit from "express-rate-limit";
import ResponseError from "../utils/responseError.js";

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    message: "Too many requests from this IP, please try again after a minute",
  },
  handler: (req, res, next, options) => {
    console.log(`🚩  ${req.socket.remoteAddress}`);
    throw new ResponseError(options.message.message, options.statusCode);
  },
});

export default limiter;
