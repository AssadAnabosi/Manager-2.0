import Session from "../models/Session.model.js";
import User from "../models/User.model.js";
import ResponseError from "../utils/responseError.js";
import userRoles from "../utils/constants/userRoles.js";
import * as statusCode from "../utils/constants/statusCodes.js";
import Log from "../models/Log.model.js";
import { THEMES, LANGUAGES } from "../utils/constants/preferences.js";

// @desc    Register a new user
export const registerUser = async (req, res) => {
  const { firstName, lastName, username, email, phoneNumber, password } =
    req.body;

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

  return res.sendStatus(statusCode.CREATED);
};

// @desc    Get all users
export const getUsers = async (req, res) => {
  const active = req.query.active;
  const search = req.query.search || "";

  const filter = {};
  filter.$or = [
    { firstName: { $regex: search, $options: "i" } },
    { lastName: { $regex: search, $options: "i" } },
  ];
  if (active) filter.active = active;
  const users = await User.find(filter);

  return res.status(statusCode.OK).json({
    success: true,
    data: {
      users,
      search,
    },
  });
};

// @desc    Get a user
export const getUser = async (req, res) => {
  return res.status(statusCode.OK).json({
    success: true,
    data: {
      user: req.User,
    },
  });
};

// @desc    Update a user
export const updateUser = async (req, res) => {
  await User.findByIdAndUpdate(req.params.userID, req.body, {
    new: true,
    runValidators: true,
  });

  return res.sendStatus(statusCode.NO_CONTENT);
};

// @desc    Delete a user and all their logs
export const deleteUser = async (req, res) => {
  if (req.params.userID === req.user.id) {
    throw new ResponseError(
      "You are not authorized to delete your own account",
      statusCode.BAD_REQUEST
    );
  }

  await User.findByIdAndDelete(req.params.userID);
  await Log.deleteMany({ worker: req.params.userID });

  return res.sendStatus(statusCode.NO_CONTENT);
};

// @desc    User changing own password
export const updatePassword = async (req, res) => {
  const { current: currentPassword, new: newPassword } = req.body;

  const user = await User.findById(req.user.id).select("+password");

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    throw new ResponseError("Invalid current password", statusCode.BAD_REQUEST);
  }

  user.password = newPassword;
  await user.save();
  await Session.deleteMany({ user: req.user.id });
  res.clearCookie("refreshToken");
  return res.status(statusCode.OK).json({
    success: true,
    message: "Password changed successfully",
  });
};

// @desc    User updating own preferences
export const updatePreferences = async (req, res) => {
  const { theme, language } = req.body;

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
    req.user.id,
    { theme, language },
    {
      new: true,
      runValidators: true,
    }
  );

  return res.status(statusCode.OK).json({
    success: true,
    message: "Preferences updated successfully",
    data: {
      theme,
      language,
    },
  });
};

// @desc    Check the availability of a username
export const checkUsername = async (req, res) => {
  const { username } = req.body;

  const user = await User.findOne({ username });
  const isAvailable = user ? false : true;

  return res.status(statusCode.OK).json({
    success: true,
    data: { isAvailable },
  });
};

// @desc    Reset a user's password by an administrator
export const resetPassword = async (req, res) => {
  const user = await User.findById(req.params.userID);

  user.password = req.body.password;
  await user.save();
  await Session.deleteMany({ user: user._id });
  return res.sendStatus(statusCode.NO_CONTENT);
};

// @desc   Update a user's role
export const updateUserRole = async (req, res) => {
  if (req.params.userID === req.user.id) {
    throw new ResponseError(
      "You are not authorized to change your role",
      statusCode.BAD_REQUEST
    );
  }

  const { role } = req.body;
  if (!userRoles.includes(role))
    throw new ResponseError(
      `Invalid User Role [${userRoles.toString()}]`,
      statusCode.BAD_REQUEST
    );

  const user = await User.findById(req.params.userID);

  user.role = role;
  await user.save();

  return res.sendStatus(statusCode.NO_CONTENT);
};

// @desc    Deactivate or Activate a user account
export const setActiveStatus = async (req, res) => {
  if (req.params.userID === req.user.id) {
    throw new ResponseError(
      "You are not authorized to deactivate your own account",
      statusCode.BAD_REQUEST
    );
  }

  const { active } = req.body;
  if (typeof active !== "boolean")
    throw new ResponseError("Invalid active status", statusCode.BAD_REQUEST);

  await User.findByIdAndUpdate(
    req.params.userID,
    { active },
    {
      new: true,
      runValidators: true,
    }
  );

  return res.sendStatus(statusCode.NO_CONTENT);
};
