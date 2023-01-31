import jwt from "jsonwebtoken";
import ms from "ms";
import User from "../models/User.model.js";
import Session from "../models/Session.model.js";
import ResponseError from "../utils/responseError.js";

// @desc    Login a user
export const login = async (req, res, next) => {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
        await Session.deleteOne({ refreshToken });
    }

    const { username, password } = req.body;
    if (!username || !password) {
        return next(new ResponseError("Please provide username and password", 400));
    }

    try {
        const user = await User.findOne({ username }).select("+password -logs");
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
        return sendTokens(user, 200, res);
    } catch (error) {
        next(error);
    }
}

// @desc    Refresh a user's access token
export const refresh = async (req, res, next) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
        return next(new ResponseError("You are not logged in", 400));
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        const user = await User.findById(decoded.id).select("-logs");
        if (!user) {
            res.clearCookie("refreshToken");
            return next(new ResponseError("User Can Not Be Found", 404));
        }

        const session = await Session.findOne({ refreshToken });
        if (!session) {
            res.clearCookie("refreshToken");
            return next(new ResponseError("Session expired", 401));
        }

        return res.status(200).json({
            success: true,
            message: "Refreshed Access Token Successfully",
            accessToken: user.getAccessToken()
        });
    } catch (error) {
        res.clearCookie("refreshToken");
        await Session.findOneAndDelete({ refreshToken });
        return next(new ResponseError("Session expired", 401));
    }
}

// @desc    Logout a user
export const logout = async (req, res, next) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
        return next(new ResponseError("You are not logged in", 400));
    }

    try {
        await Session.findOneAndDelete({ refreshToken });
        res.clearCookie("refreshToken");
        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
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

// @desc   Tokens Generator
const sendTokens = async (user, statusCode, res) => {
    const accessToken = user.getAccessToken();
    const refreshToken = user.getRefreshToken();

    const secure = process.env.SECURE_COOKIE === "true" ? true : false;
    const maxAge = ms(process.env.MAX_AGE);

    await Session.create({ refreshToken, user: user._id, expiresAt: Date.now() + maxAge });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge,
        sameSite: false,
        secure,
    });

    user.password = undefined;
    return res
        .status(statusCode)
        .json({
            success: true,
            message: "User logged in successfully",
            user,
            accessToken
        });
}