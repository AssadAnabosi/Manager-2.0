import ResponseError from "../utils/responseError.js";
import capitalizeFirstLetter from "../utils/capitalizeFirstLetter.js";
import * as statusCode from "../utils/constants/statusCodes.js";

const errorHandler = async (err, c) => {
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
  if (!error.statusCode) await errorLogger(err, c);

  //  Mongoose Validation Error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ResponseError(message, statusCode.BAD_REQUEST);
  }

  const responseCode = error.statusCode || statusCode.INTERNAL_SERVER_ERROR;
  return c.json(
    {
      success: false,
      message: error.message || "Internal Server Error",
    },
    responseCode
  );
};

export default errorHandler;

const errorLogger = async (err, c) => {
  console.log(`⚠️  Error Occurred - ${new Date().toLocaleString()}`);
  // [IP]
  console.log(`📌  [${c.get("ip_address")}]`);
  // METHOD URL
  const originalUrl = c.req.url.replace(/https?:\/\/[^/]+/i, "");
  console.log(`📌  ${c.req.method} ${originalUrl}`);
  // body
  if ([`POST`, `PUT`, `PATCH`].includes(c.req.method)) {
    try {
      const body = JSON.stringify(await c.req.json());
      console.log(`📌  Body: \n${body}`);
    } catch (error) {
      console.log(`📌  Body: [Cannot parse]`);
    }
  }
  // error
  console.log(`---~~~--- Start of Error ---~~~---`);
  console.log(err);
  console.log(`---~~~--- End of Error ---~~~---`);
  return;
};
