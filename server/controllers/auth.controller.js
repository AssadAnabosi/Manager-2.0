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
        
        if (!user.active) {
            return next(new ResponseError("Your account has been deactivated", 403));
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

// @desc    Get current logged in user
export const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        return res.status(200).json({
            success: true,
            data: user
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