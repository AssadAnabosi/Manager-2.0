import jwt from "jsonwebtoken";
import ms from "ms";
import User from "../models/User.model.js";
import Session from "../models/Session.model.js";
import ResponseError from "../utils/responseError.js";
import * as statusCode from "../utils/constants/statusCodes.js";

// @desc    Login a user
export const login = async (req, res, next) => {
  const { refreshToken } = req.cookies;
  if (refreshToken) {
    await Session.deleteOne({ refreshToken });
  }

  const { username, password } = req.body;

  const user = await User.findOne({ username }).select("+password");
  //  Invalid Username
  if (!user) {
    return next(
      new ResponseError("Invalid Credentials", statusCode.NOT_AUTHENTICATED)
    );
  }
  //  Deactivated Account
  if (!user.active) {
    return next(
      new ResponseError(
        "Your account has been deactivated",
        statusCode.NOT_AUTHORIZED
      )
    );
  }
  //  Password Check
  const isMatch = await user.matchPassword(password);
  // Wrong Password
  if (!isMatch) {
    return next(
      new ResponseError("Invalid Credentials", statusCode.NOT_AUTHENTICATED)
    );
  }
  //  Valid User
  return sendTokens(user, req.ip_address, statusCode.OK, res);
};

// @desc    Refresh a user's access token
export const refresh = async (req, res, next) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return next(
      new ResponseError("You are not logged in", statusCode.BAD_REQUEST)
    );
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id).select("-active");
    if (!user) {
      res.clearCookie("refreshToken");
      return next(
        new ResponseError("User account deleted", statusCode.NOT_FOUND)
      );
    }

    const session = await Session.findOne({ refreshToken });
    if (!session) {
      res.clearCookie("refreshToken");
      return next(
        new ResponseError("Please Login Again", statusCode.NOT_AUTHENTICATED)
      );
    }

    return res.status(statusCode.OK).json({
      success: true,
      message: "Refreshed Access Token Successfully",
      data: {
        accessToken: user.getAccessToken(session._id),
      },
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.clearCookie("refreshToken");
      await Session.findOneAndDelete({ refreshToken });
      return next(
        new ResponseError(
          "Token Expired, Please Login Again",
          statusCode.NOT_AUTHENTICATED
        )
      );
    }
    return next(error);
  }
};

// @desc    Logout a user
export const logout = async (req, res, next) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return next(
      new ResponseError("You are not logged in", statusCode.BAD_REQUEST)
    );
  }

  await Session.findOneAndDelete({ refreshToken });
  res.clearCookie("refreshToken");
  return res.status(statusCode.OK).json({
    success: true,
    message: "Logged out successfully",
  });
};

// @desc    Get current logged in user
export const getMe = async (req, res, next) => {
  return res.status(statusCode.OK).json({
    success: true,
    data: {
      user: req.user,
    },
  });
};

// @desc   Tokens Generator
const sendTokens = async (user, ipAddress, statusCode, res) => {
  const refreshToken = user.getRefreshToken();

  const secure = process.env.SECURE_COOKIE === "true" ? true : false;
  const maxAge = ms(process.env.MAX_AGE);

  const session = await Session.create({
    refreshToken,
    ipAddress: ipAddress,
    user: user._id,
    expiresAt: Date.now() + maxAge,
  });
  const accessToken = user.getAccessToken(session._id);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge,
    sameSite: "Strict",
    secure,
  });

  user.password = undefined;
  user.active = undefined;
  return res.status(statusCode).json({
    success: true,
    message: `Welcome back, ${user.fullName}`,
    data: {
      user,
      accessToken,
    },
  });
};
