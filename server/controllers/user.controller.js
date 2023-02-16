import Session from "../models/Session.model.js";
import User from "../models/User.model.js";
import ResponseError from "../utils/ResponseError.js";
import accessLevels from "../utils/constants/accessLevels.js";
import * as statusCode from "../utils/constants/statusCodes.js";

// @desc    Register a new user
export const registerUser = async (req, res, next) => {
  const { firstName, lastName, username, email, phoneNumber, password } =
    req.body;
  try {
    await User.create({
      firstName,
      lastName,
      username,
      email,
      phoneNumber,
      password,
    });

    return res.sendStatus(statusCode.CREATED);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
export const getUsers = async (req, res, next) => {
  const search = req.query.search || "";

  try {
    const users = await User.find({
      $or: [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
      ],
    }).select("-logs");

    return res.status(statusCode.OK).json({
      success: true,
      data: {
        users,
        search,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a user
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userID);
    if (!user) {
      return next(new ResponseError("User not found", statusCode.NOT_FOUND));
    }

    return res.status(statusCode.OK).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a user
export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userID, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user)
      return next(new ResponseError("User not found", statusCode.NOT_FOUND));

    return res.sendStatus(statusCode.NO_CONTENT);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user
export const deleteUser = async (req, res, next) => {
  if (req.params.userID === req.user.id) {
    return next(
      new ResponseError(
        "You are not authorized to delete your own account",
        statusCode.BAD_REQUEST
      )
    );
  }

  try {
    const user = await User.findByIdAndDelete(req.params.userID);
    if (!user)
      return next(new ResponseError("User not found", statusCode.NOT_FOUND));

    return res.sendStatus(statusCode.NO_CONTENT);
  } catch (error) {
    next(error);
  }
};

// @desc    User changing own password
export const changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return next(new ResponseError("User not found", statusCode.NOT_FOUND));
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return next(
        new ResponseError("Wrong current password", statusCode.BAD_REQUEST)
      );
    }

    user.password = newPassword;
    await user.save();

    return res.status(statusCode.OK).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check the availability of a username
export const checkUsername = async (req, res, next) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ username });
    const isAvailable = user ? false : true;

    return res.status(statusCode.OK).json({
      success: true,
      data: isAvailable,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset a user's password by an administrator
export const resetPassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userID);
    if (!user)
      return next(new ResponseError("User not found", statusCode.NOT_FOUND));

    user.password = req.body.password;
    await user.save();
    await Session.deleteMany({ user: user._id });
    return res.sendStatus(statusCode.NO_CONTENT);
  } catch (error) {
    next(error);
  }
};

// @desc   Change user's access level (authorization)
export const setAccessLevel = async (req, res, next) => {
  if (req.params.userID === req.user.id) {
    return next(
      new ResponseError(
        "You are not authorized to change your access level",
        statusCode.BAD_REQUEST
      )
    );
  }

  const { accessLevel } = req.body;
  if (!accessLevels.includes(accessLevel))
    return next(
      new ResponseError("Invalid access level", statusCode.BAD_REQUEST)
    );

  try {
    const user = await User.findById(req.params.userID);
    if (!user)
      return next(new ResponseError("User not found", statusCode.NOT_FOUND));

    user.accessLevel = accessLevel;
    await user.save();

    return res.sendStatus(statusCode.NO_CONTENT);
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate or Activate a user account
export const setActiveStatus = async (req, res, next) => {
  if (req.params.userID === req.user.id) {
    return next(
      new ResponseError(
        "You are not authorized to deactivate your own account",
        statusCode.BAD_REQUEST
      )
    );
  }

  const { active } = req.body;
  if (active !== "true" && active !== "false")
    return next(
      new ResponseError("Invalid active status", statusCode.BAD_REQUEST)
    );

  try {
    const user = await User.findByIdAndUpdate(
      req.params.userID,
      { active },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!user)
      return next(new ResponseError("User not found", statusCode.NOT_FOUND));

    return res.sendStatus(statusCode.NO_CONTENT);
  } catch (error) {
    next(error);
  }
};
