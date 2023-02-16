import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import ResponseError from "../utils/responseError.js";
import { L1, L2, L3, ADMIN } from "../constants/accessLevels.js";
import * as statusCode from "../constants/statusCodes.js";

// @help    accessLevels = ["User", "Spectator", "Moderator", "Administrator"]

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
    return next(
      new ResponseError(
        "Not Authenticated To Access This Route",
        statusCode.NOT_AUTHENTICATED
      )
    );
  }
};

// @desc    required accessLevel is higher than User
export const hasLevel2Access = async (req, res, next) => {
  if (req.user.accessLevel === L1) {
    return next(
      new ResponseError(
        "Not Authorized To Access This Route",
        statusCode.NOT_AUTHORIZED
      )
    );
  }

  return next();
};

// @desc    required accessLevel is higher than Spectator
export const hasLevel3Access = async (req, res, next) => {
  hasLevel2Access(req, res, () => {
    if (req.user.accessLevel === L2) {
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
// @desc    required accessLevel is Administrator
export const isAdmin = async (req, res, next) => {
  if (req.user.accessLevel !== ADMIN) {
    return next(
      new ResponseError(
        "Not Authorized To Access This Route",
        statusCode.NOT_AUTHORIZED
      )
    );
  }

  return next();
};
