import User from "../models/User.model.js";
import ResponseError from "../utils/responseError.js";

// @desc    Register a new user
export const register = async (req, res, next) => {
    const { firstName, lastName, username, email, phoneNumber, password } = req.body;
    if (!firstName || !lastName || !username || !email || !password) {
        return next(new ResponseError("Please provide first and last names, username, email, and password", 400));
    }

    try {
        await User.create({
            firstName, lastName, username, email, phoneNumber, password
        });

        return res.sendStatus(201);
    } catch (error) {
        next(error);
    }
}

// @desc    Login a user
export const login = async (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return next(new ResponseError("Please provide username and password", 400));
    }

    try {
        const user = await User.findOne({ username }).select("+password");
        //  Invalid Username
        if (!user) {
            return next(new ResponseError("Invalid Credentials", 401));
        }
        //  Deactivated Account
        if (!user.active) {
            return next(new ResponseError("Your account has been deactivated", 403));
        }
        //  Password Check
        const isMatch = await user.matchPassword(password);
        // Wrong Password
        if (!isMatch) {
            return next(new ResponseError("Invalid Credentials", 401));
        }
        //  Valid User
        return sendToken(user, 200, res);
    } catch (error) {
        next(error);
    }
}

// @desc    Get current logged in user
export const getMe = async (req, res, next) => {
    return res.status(200).json({
        success: true,
        data: req.user
    });
}

// @desc   Token Generator
const sendToken = (user, statusCode, res) => {
    const accessToken = user.getAccessToken();

    return res
        .status(statusCode)
        .json({
            success: true,
            message: "User logged in successfully",
            accessToken
        });
}