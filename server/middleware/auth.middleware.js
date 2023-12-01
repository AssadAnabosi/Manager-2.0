import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import Session from "../models/Session.model.js";
import * as statusCode from "../utils/constants/statusCodes.js";
import ResponseError from "../utils/responseError.js";

// @desc   Check if user is authenticated
export const isAuth = async (req, res, next) => {
  let accessToken;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    accessToken = req.headers.authorization.split(" ")[1];
  }

  if (!accessToken) {
    return next(
      new ResponseError(
        "Not Authenticated To Access This Route",
        statusCode.NOT_AUTHENTICATED
      )
    );
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id).select("-logs");
    const session = await Session.findById(decoded.sessionId);
    if (!session)
      return next(
        new ResponseError("Please Login Again", statusCode.NOT_AUTHENTICATED)
      );

    if (!user) {
      return next(
        new ResponseError("User Can Not Be Found", statusCode.NOT_FOUND)
      );
    }

    if (!user.active) {
      return next(
        new ResponseError(
          "Your account has been deactivated",
          statusCode.NOT_AUTHORIZED
        )
      );
    }
    user.active = undefined;
    req.user = user;

    return next();
  } catch (error) {
    // JWT token has expired
    if (error.name === "TokenExpiredError") {
      return next(
        new ResponseError(
          "Token Expired, Please Refresh Token",
          statusCode.NOT_AUTHORIZED
        )
      );
    }
    return next(error);
  }
};

// @desc  Dynamic authorization middleware [allowed user roles]
export const authorize = (userRoles = []) => {
  userRoles = typeof userRoles === "string" ? [userRoles] : userRoles;

  return async (req, res, next) => {
    await isAuth(req, res, (error) => {
      if (error) return next(error);
      if (userRoles.length && !userRoles.includes(req.user.role)) {
        return next(
          new ResponseError(
            "Not Authorized To Access This Route",
            statusCode.NOT_AUTHORIZED
          )
        );
      }

      return next();
    });
  };
};

// @desc  Dynamic authorization middleware [not allowed user roles]
export const notAuthorized = (userRoles = []) => {
  userRoles = typeof userRoles === "string" ? [userRoles] : userRoles;

  return async (req, res, next) => {
    await isAuth(req, res, (error) => {
      if (error) return next(error);
      if (userRoles.length && userRoles.includes(req.user.role)) {
        return next(
          new ResponseError(
            "Not Authorized To Access This Route",
            statusCode.NOT_AUTHORIZED
          )
        );
      }

      return next();
    });
  };
};
