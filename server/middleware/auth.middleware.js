import jwt from "jsonwebtoken";
import { createMiddleware } from "hono/factory";
import User from "../models/User.model.js";
import Session from "../models/Session.model.js";
import * as statusCode from "../utils/constants/statusCodes.js";
import ResponseError from "../utils/responseError.js";

// @desc   Check if user is authenticated
export const isAuth = createMiddleware(async (c, next) => {
  let accessToken;

  if (
    c.req.header("authorization") &&
    c.req.header("authorization").startsWith("Bearer")
  ) {
    accessToken = c.req.header("authorization").split(" ")[1];
  }

  if (!accessToken) {
    throw new ResponseError(
      "Not Authenticated To Access This Route",
      statusCode.NOT_AUTHENTICATED
    );
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id).select("-logs");
    const session = await Session.findById(decoded.sessionId);
    if (!session)
      throw new ResponseError(
        "Please Login Again",
        statusCode.NOT_AUTHENTICATED
      );

    if (!user) {
      throw new ResponseError("User Can Not Be Found", statusCode.NOT_FOUND);
    }

    if (!user.active) {
      throw new ResponseError(
        "Your account has been deactivated",
        statusCode.NOT_AUTHORIZED
      );
    }
    user.active = undefined;
    c.set("user", user);

    await next();
  } catch (error) {
    // JWT token has expired
    if (error.name === "TokenExpiredError") {
      throw new ResponseError(
        "Token Expired, Please Refresh Token",
        statusCode.NOT_AUTHORIZED
      );
    }
    throw error;
  }
});

// @desc  Dynamic authorization middleware [allowed user roles]
export const authorize = (userRoles = []) => {
  userRoles = typeof userRoles === "string" ? [userRoles] : userRoles;

  return createMiddleware(async (c, next) => {
    await isAuth(c, async (error) => {
      if (error) throw error;
      if (userRoles.length && !userRoles.includes(c.var.user.role)) {
        throw new ResponseError(
          "Not Authorized To Access This Route",
          statusCode.NOT_AUTHORIZED
        );
      }

      await next();
    });
  });
};

// @desc  Dynamic authorization middleware [not allowed user roles]
export const notAuthorized = (userRoles = []) => {
  userRoles = typeof userRoles === "string" ? [userRoles] : userRoles;

  return createMiddleware(async (c, next) => {
    await isAuth(c, async (error) => {
      if (error) throw error;
      if (userRoles.length && userRoles.includes(c.var.user.role)) {
        throw new ResponseError(
          "Not Authorized To Access This Route",
          statusCode.NOT_AUTHORIZED
        );
      }

      await next();
    });
  });
};
