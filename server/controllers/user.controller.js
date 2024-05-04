import Session from "../models/Session.model.js";
import User from "../models/User.model.js";
import ResponseError from "../utils/responseError.js";
import userRoles from "../utils/constants/userRoles.js";
import * as statusCode from "../utils/constants/statusCodes.js";
import Log from "../models/Log.model.js";
import { THEMES, LANGUAGES } from "../utils/constants/preferences.js";
import { clearRefreshTokenCookie } from "./auth.controller.js";

// @desc    Register a new user
export const registerUser = async (c) => {
  const { firstName, lastName, username, email, phoneNumber, password } =
    await c.req.json();

  if (!/^[a-zA-Z0-9-_.]*$/.test(username)) {
    throw new ResponseError(
      "Username can only contain letters, numbers, hyphens, underscores, and periods",
      statusCode.BAD_REQUEST
    );
  }

  await User.create({
    firstName,
    lastName,
    username,
    email,
    phoneNumber,
    password,
  });
  return c.json(
    {
      success: true,
      message: "User was registered successfully",
    },
    statusCode.CREATED
  );
};

// @desc    Get all users
export const getUsers = async (c) => {
  const active = c.req.query("active");
  const search = c.req.query("search") || "";

  const filter = {};
  filter.$or = [
    { firstName: { $regex: search, $options: "i" } },
    { lastName: { $regex: search, $options: "i" } },
  ];
  if (active) filter.active = active;
  const users = await User.find(filter);

  return c.json(
    {
      success: true,
      data: {
        users,
        search,
      },
    },
    statusCode.OK
  );
};

// @desc    Get a user
export const getUser = async (c) => {
  return c.json(
    {
      success: true,
      data: {
        user: c.var.User,
      },
    },
    statusCode.OK
  );
};

// @desc    Update a user
export const updateUser = async (c) => {
  const { userID } = c.req.param();
  const body = await c.req.json();
  await User.findByIdAndUpdate(userID, body, {
    new: true,
    runValidators: true,
  });

  return c.json(
    {
      success: true,
      message: "User was updated successfully",
    },
    statusCode.OK
  );
};

// @desc    Delete a user and all their logs
export const deleteUser = async (c) => {
  const { userID } = c.req.param();
  if (userID === c.var.user.id) {
    throw new ResponseError(
      "You are not authorized to delete your own account",
      statusCode.BAD_REQUEST
    );
  }

  await User.findByIdAndDelete(userID);
  await Log.deleteMany({ worker: userID });

  return c.json(
    {
      success: true,
      message: "User was deleted successfully",
    },
    statusCode.OK
  );
};

// @desc    User changing own password
export const updatePassword = async (c) => {
  const body = await c.req.json();
  const { current: currentPassword, new: newPassword } = body;

  const user = await User.findById(c.var.user.id).select("+password");

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    throw new ResponseError("Invalid current password", statusCode.BAD_REQUEST);
  }

  user.password = newPassword;
  await user.save();
  await Session.deleteMany({ user: c.var.user.id });
  clearRefreshTokenCookie(c);
  return c.json(
    {
      success: true,
      message: "Password changed successfully",
    },
    statusCode.OK
  );
};

// @desc    User updating own preferences
export const updatePreferences = async (c) => {
  const { theme, language } = await c.req.json();

  if (!THEMES.includes(theme))
    throw new ResponseError(
      `Invalid theme [${THEMES.toString()}]`,
      statusCode.BAD_REQUEST
    );
  if (!LANGUAGES.includes(language))
    throw new ResponseError(
      `Invalid language [${LANGUAGES.toString()}]`,
      statusCode.BAD_REQUEST
    );

  await User.findByIdAndUpdate(
    c.var.user.id,
    { theme, language },
    {
      new: true,
      runValidators: true,
    }
  );

  return c.json(
    {
      success: true,
      message: "Preferences updated successfully",
      data: {
        theme,
        language,
      },
    },
    statusCode.OK
  );
};

// @desc    Check the availability of a username
export const checkUsername = async (c) => {
  const { username } = await c.req.json();

  const user = await User.findOne({ username });
  const isAvailable = user ? false : true;

  return c.json(
    {
      success: true,
      data: { isAvailable },
    },
    statusCode.OK
  );
};

// @desc    Reset a user's password by an administrator
export const resetPassword = async (c) => {
  const { userID } = c.req.param();
  const user = await User.findById(userID);
  const body = await c.req.json();

  user.password = body.password;
  await user.save();
  await Session.deleteMany({ user: user._id });
  return c.json(
    {
      success: true,
      message: "Password reset successfully",
    },
    statusCode.OK
  );
};

// @desc   Update a user's role
export const updateUserRole = async (c) => {
  const { userID } = c.req.param();
  const body = await c.req.json();
  if (userID === c.var.user.id) {
    throw new ResponseError(
      "You are not authorized to change your role",
      statusCode.BAD_REQUEST
    );
  }

  const { role } = body;
  if (!userRoles.includes(role))
    throw new ResponseError(
      `Invalid User Role [${userRoles.toString()}]`,
      statusCode.BAD_REQUEST
    );

  const user = await User.findById(userID);

  user.role = role;
  await user.save();

  return c.json(
    {
      success: true,
      message: "User role updated successfully",
    },
    statusCode.OK
  );
};

// @desc    Deactivate or Activate a user account
export const setActiveStatus = async (c) => {
  const { userID } = c.req.param();
  const body = await c.req.json();

  if (userID === c.var.user.id) {
    throw new ResponseError(
      "You are not authorized to deactivate your own account",
      statusCode.BAD_REQUEST
    );
  }

  const { active } = body;
  if (typeof active !== "boolean")
    throw new ResponseError("Invalid active status", statusCode.BAD_REQUEST);

  await User.findByIdAndUpdate(
    userID,
    { active },
    {
      new: true,
      runValidators: true,
    }
  );
  return c.json(
    {
      success: true,
      message: `User account ${active ? "activated" : "deactivated"} successfully`,
    },
    statusCode.OK
  );
};
