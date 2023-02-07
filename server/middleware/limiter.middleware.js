import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    message: "Too many requests from this IP, please try again after a minute",
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).send(options.message);
  },
});

export default limiter;
