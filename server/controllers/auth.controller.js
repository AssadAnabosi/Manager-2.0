import User from "../models/User.model.js";
import ResponseError from "../utils/responseError.js";

// @desc    Register a new user
export const register = async (req, res, next) => {
    const { firstName, lastName, username, email, phoneNumber, password } = req.body;
    //  @desc   Validate user input
    if (!firstName || !lastName || !username || !email || !password) {
        return next(new ResponseError("Please provide first and last names, username, email, and password", 400));
    }
    try {
        await User.create({
            firstName, lastName, username, email, phoneNumber, password
        });
        return res.status(201).json({
            success: true,
            message: "User created successfully",
        });
    } catch (error) {
        next(error);
    }
}

// @desc    Login a user
export const login = async (req, res, next) => {
    const { username, password } = req.body;
    //  @desc   Validate user input
    if (!username || !password) {
        return next(new ResponseError("Please provide an email and password", 400));
    }
    try {
        const user = await User.findOne({ username }).select("+password");
        // @desc    Invalid Username
        if (!user) {
            return next(new ResponseError("Invalid Credentials", 401));
        }
        // @desc    Password Check
        const isMatch = await user.matchPassword(password);
        //  @desc   Wrong Password
        if (!isMatch) {
            return next(new ResponseError("Invalid Credentials", 401));
        }
        //  @desc   Valid User
        return generateToken(user, 200, res);
    } catch (error) {
        next(error);
    }
}

// @desc    Change Password
export const changePassword = async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    //  @desc   Validate user input
    if (!currentPassword || !newPassword) {
        return next(new ResponseError("Please provide current and new passwords", 400));
    }
    try {
        const user = await User.findById(req.user.id).select("+password");
        const isMatch = await user.matchPassword(currentPassword);
        //  @desc   Wrong Password
        if (!isMatch) {
            return next(new ResponseError("Wrong password", 401));
        }
        //  @desc   Valid User
        user.password = newPassword;
        await user.save();
        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });
    } catch (error) {
        next(error);
    }
}


// @desc   Token Generator
const generateToken = (user, statusCode, res) => {
    const token = user.getSignedToken();
    return res
        .status(statusCode)
        .json({
            success: true,
            message: "User logged in successfully",
            token
        });
}