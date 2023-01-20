import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import ResponseError from "../utils/responseError.js";

// @desc    accessLevels are: User, Spectator, Moderator, Administrator

// @desc   Check if user is authenticated
export const isAuth = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return next(new ResponseError("Not Authenticated To Access This Route", 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return next(new ResponseError("User Can Not Be Found", 404));
        }

        req.user = user;

        return next();
    } catch (error) {
        return next(new ResponseError("Not Authenticated To Access This Route", 401));
    }
}

// @desc    Check if user is authorized [required accessLevel is higher than User]
export const hasLevel2Access = async (req, res, next) => {
    if (req.user.accessLevel === "User") {
        return next(new ResponseError("Not Authorized To Access This Route", 403));
    }

    return next();
}

// @desc    Check if user is authorized [required accessLevel is higher than Spectator]
export const hasLevel3Access = async (req, res, next) => {
    if (req.user.accessLevel === "User" || req.user.accessLevel === "Spectator") {
        return next(new ResponseError("Not Authorized To Access This Route", 403));
    }

    return next();
}
// @desc    Check if user is has Administration Authority
export const isAdmin = async (req, res, next) => {
    if (req.user.accessLevel !== "Administrator") {
        return next(new ResponseError("Not Authorized To Access This Route", 403));
    }

    return next();
}