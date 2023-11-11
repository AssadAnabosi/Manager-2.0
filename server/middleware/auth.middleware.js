import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import * as statusCode from "../utils/constants/statusCodes.js";

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
    return res.status(statusCode.NOT_AUTHENTICATED).json({
      success: false,
      message: "Not Authenticated To Access This Route",
    });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id).select("-logs");

    if (!user) {
      return res.status(statusCode.NOT_FOUND).json({
        success: false,
        message: "User Can Not Be Found",
      });
    }

    if (!user.active) {
      return res.status(statusCode.NOT_AUTHORIZED).json({
        success: false,
        message: "Your account has been deactivated",
      });
    }
    user.active = undefined;
    req.user = user;

    return next();
  } catch (error) {
    // JWT token has expired
    return res.status(statusCode.NOT_AUTHENTICATED).json({
      success: false,
      message: "Not Authenticated To Access This Route",
    });
  }
};

// @desc  Dynamic authorization middleware [allowed user roles]
export const authorize = (userRoles = []) => {
  userRoles = typeof userRoles === "string" ? [userRoles] : userRoles;

  return async (req, res, next) => {
    await isAuth(req, res, () => {
      if (userRoles.length && !userRoles.includes(req.user.role)) {
        return res.status(statusCode.NOT_AUTHORIZED).json({
          success: false,
          message: "Not Authorized To Access This Route",
        });
      }

      return next();
    });
  };
};

// @desc  Dynamic authorization middleware [not allowed user roles]
export const notAuthorized = (userRoles = []) => {
  userRoles = typeof userRoles === "string" ? [userRoles] : userRoles;

  return async (req, res, next) => {
    await isAuth(req, res, () => {
      if (userRoles.length && userRoles.includes(req.user.role)) {
        return res.status(statusCode.NOT_AUTHORIZED).json({
          success: false,
          message: "Not Authorized To Access This Route",
        });
      }

      return next();
    });
  };
};
