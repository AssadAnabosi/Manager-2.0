import jwt from "jsonwebtoken";
import ms from "ms";
import User from "../models/User.model.js";
import Session from "../models/Session.model.js";
import ResponseError from "../utils/responseError.js";
import * as statusCode from "../utils/constants/statusCodes.js";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";

const secure = process.env.SECURE_COOKIE === "true" ? true : false;
const maxAge = ms(process.env.MAX_AGE);

// @desc    Login a user
export const login = async (c) => {
  const { refreshToken } = getCookie(c);
  if (refreshToken) {
    await Session.deleteOne({ refreshToken });
  }

  const { username, password } = await c.req.json();

  const user = await User.findOne({ username }).select("+password");
  //  Invalid Username
  if (!user) {
    throw new ResponseError(
      "Invalid Credentials",
      statusCode.NOT_AUTHENTICATED
    );
  }
  //  Deactivated Account
  if (!user.active) {
    throw new ResponseError(
      "Your account has been deactivated",
      statusCode.NOT_AUTHORIZED
    );
  }
  //  Password Check
  const isMatch = await user.matchPassword(password);
  // Wrong Password
  if (!isMatch) {
    throw new ResponseError(
      "Invalid Credentials",
      statusCode.NOT_AUTHENTICATED
    );
  }
  //  Valid User
  return c.json(await sendTokens(user, c), statusCode.OK);
};

// @desc    Refresh a user's access token
export const refresh = async (c) => {
  const { refreshToken } = getCookie(c);
  if (!refreshToken) {
    throw new ResponseError("You are not logged in", statusCode.BAD_REQUEST);
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id).select("-active");
    if (!user) {
      clearRefreshTokenCookie(c);
      throw new ResponseError("User account deleted", statusCode.NOT_FOUND);
    }

    const session = await Session.findOne({ refreshToken });
    if (!session) {
      clearRefreshTokenCookie(c);
      throw new ResponseError(
        "Please Login Again",
        statusCode.NOT_AUTHENTICATED
      );
    }

    return c.json(
      {
        success: true,
        message: "Refreshed Access Token Successfully",
        data: {
          accessToken: user.getAccessToken(session._id),
        },
      },
      statusCode.OK
    );
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      clearRefreshTokenCookie(c);
      await Session.findOneAndDelete({ refreshToken });
      throw new ResponseError(
        "Token Expired, Please Login Again",
        statusCode.NOT_AUTHENTICATED
      );
    }
    throw error;
  }
};

// @desc    Logout a user
export const logout = async (c) => {
  const { refreshToken } = getCookie(c);
  if (!refreshToken) {
    throw new ResponseError("You are not logged in", statusCode.BAD_REQUEST);
  }

  await Session.findOneAndDelete({ refreshToken });
  clearRefreshTokenCookie(c);
  return c.json(
    {
      success: true,
      message: "Logged out successfully",
    },
    statusCode.OK
  );
};

// @desc    Get current logged in user
export const getMe = async (c) => {
  return c.json(
    {
      success: true,
      data: {
        user: c.var.user,
      },
    },
    statusCode.OK
  );
};

// @desc   Tokens Generator
const sendTokens = async (user, c) => {
  const refreshToken = user.getRefreshToken();

  const session = await Session.create({
    refreshToken,
    ipAddress: c.get("ip_address"),
    user: user._id,
    expiresAt: Date.now() + maxAge,
  });
  const accessToken = user.getAccessToken(session._id);

  setRefreshTokenCookie(c, refreshToken);

  user.password = undefined;
  user.active = undefined;
  return {
    success: true,
    message: `Welcome back, ${user.fullName}`,
    data: {
      user,
      accessToken,
    },
  };
};

export const setRefreshTokenCookie = (c, refreshToken) => {
  const ONE_SECOND = 1000;
  setCookie(c, "refreshToken", refreshToken, {
    secure: secure,
    domain: process.env.DOMAIN_URL.split("//")[1],
    path: "/",
    httpOnly: true,
    maxAge: maxAge / ONE_SECOND,
    sameSite: "Strict",
  });
};

export const clearRefreshTokenCookie = (c) => {
  deleteCookie(c, "refreshToken", {
    secure: secure,
    domain: process.env.DOMAIN_URL.split("//")[1],
    path: "/",
    httpOnly: true,
  });
};
