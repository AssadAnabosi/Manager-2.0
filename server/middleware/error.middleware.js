import ResponseError from "../utils/responseError.js";
import capitalizeFirstLetter from "../utils/capitalizeFirstLetter.js";
import * as statusCode from "../utils/constants/statusCodes.js";

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    let message;
    if (
      Object.keys(err.keyPattern)[0] === "date" &&
      Object.keys(err.keyPattern)[1] === "worker"
    )
      message = "There is a record of this log already";
    else
      switch (Object.keys(err.keyPattern)[0]) {
        case "email":
          message = "Email is already registered";
          break;
        case "username":
          message = "Username is already taken";
          break;
        default:
          message = `${capitalizeFirstLetter(
            Object.keys(err.keyPattern)[0]
          )} already exists`;
          break;
      }
    error = new ResponseError(message, statusCode.CONFLICT);
  }

  // Log to console for dev if error wasn't thrown by ResponseError
  if (!error.statusCode) errorLogger(err, req);

  //  Mongoose Validation Error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ResponseError(message, statusCode.BAD_REQUEST);
  }

  return res.status(error.statusCode || statusCode.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: error.message || "Internal Server Error",
  });
};

export default errorHandler;

const errorLogger = (err, req) => {
  console.log(`⚠️  Error Occurred - ${new Date().toLocaleString()}`);
  // [IP]
  console.log(`📌  [${req.ip_address}]`);
  // METHOD URL
  console.log(`📌  ${req.method} ${req.originalUrl}`);
  // body
  console.log(`📌  Body: \n${JSON.stringify(req.body)}`);
  // error
  console.log(`---~~~--- Start of Error ---~~~---`);
  console.log(err);
  console.log(`---~~~--- End of Error ---~~~---`);
  return;
};
