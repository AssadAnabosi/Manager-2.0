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

  try {
    const user = await User.findOne({ username }).select("+password -logs");
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
    return sendTokens(user, statusCode.OK, res);
  } catch (error) {
    next(error);
  }
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

    const user = await User.findById(decoded.id).select("-logs");
    if (!user) {
      res.clearCookie("refreshToken");
      return next(
        new ResponseError("User Can Not Be Found", statusCode.NOT_FOUND)
      );
    }

    const session = await Session.findOne({ refreshToken });
    if (!session) {
      res.clearCookie("refreshToken");
      return next(
        new ResponseError("Session expired", statusCode.NOT_AUTHENTICATED)
      );
    }

    return res.status(statusCode.OK).json({
      success: true,
      message: "Refreshed Access Token Successfully",
      accessToken: user.getAccessToken(),
    });
  } catch (error) {
    res.clearCookie("refreshToken");
    await Session.findOneAndDelete({ refreshToken });
    return next(
      new ResponseError("Session expired", statusCode.NOT_AUTHENTICATED)
    );
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

  try {
    await Session.findOneAndDelete({ refreshToken });
    res.clearCookie("refreshToken");
    return res.status(statusCode.OK).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
export const getMe = async (req, res, next) => {
  return res.status(statusCode.OK).json({
    success: true,
    data: req.user,
  });
};

// @desc   Tokens Generator
const sendTokens = async (user, statusCode, res) => {
  const accessToken = user.getAccessToken();
  const refreshToken = user.getRefreshToken();

  const secure = process.env.SECURE_COOKIE === "true" ? true : false;
  const maxAge = ms(process.env.MAX_AGE);

  await Session.create({
    refreshToken,
    user: user._id,
    expiresAt: Date.now() + maxAge,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge,
    sameSite: false,
    secure,
  });

  user.password = undefined;
  return res.status(statusCode).json({
    success: true,
    message: "User logged in successfully",
    user,
    accessToken,
  });
};
