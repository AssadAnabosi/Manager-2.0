import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { L1, L2, L3, ADMIN } from "../utils/constants/accessLevels.js";
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

// @desc    required accessLevel is higher than User
export const hasLevel2Access = async (req, res, next) => {
  if (req.user.accessLevel === L1) {
    return res.status(statusCode.NOT_AUTHORIZED).json({
      success: false,
      message: "Not Authorized To Access This Route",
    });
  }

  return next();
};

// @desc    required accessLevel is higher than Spectator
export const hasLevel3Access = async (req, res, next) => {
  hasLevel2Access(req, res, () => {
    if (req.user.accessLevel === L2) {
      return res.status(statusCode.NOT_AUTHORIZED).json({
        success: false,
        message: "Not Authorized To Access This Route",
      });
    }

    return next();
  });
};
// @desc    required accessLevel is Administrator
export const isAdmin = async (req, res, next) => {
  if (req.user.accessLevel !== ADMIN) {
    return res.status(statusCode.NOT_AUTHORIZED).json({
      success: false,
      message: "Not Authorized To Access This Route",
    });
  }

  return next();
};
