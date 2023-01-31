import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { L1, L2, L3, ADMIN } from "../constants/accessLevels.js";
import ResponseError from "../utils/responseError.js";

// @help    accessLevels = ["User", "Spectator", "Moderator", "Administrator"]

// @desc   Check if user is authenticated
export const isAuth = async (req, res, next) => {
    let accessToken;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        accessToken = req.headers.authorization.split(" ")[1];
    }

    if (!accessToken) {
        return next(new ResponseError("Not Authenticated To Access This Route", 401));
    }

    try {
        const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
        const user = await User.findById(decoded.id).select("-logs");

        if (!user) {
            return next(new ResponseError("User Can Not Be Found", 404));
        }

        if (!user.active) {
            return next(new ResponseError("Your account has been deactivated", 403));
        }

        req.user = user;

        return next();
    } catch (error) {
        return next(new ResponseError("Not Authenticated To Access This Route", 401));
    }
}

// @desc    required accessLevel is higher than User
export const hasLevel2Access = async (req, res, next) => {
    if (req.user.accessLevel === L1) {
        return next(new ResponseError("Not Authorized To Access This Route", 403));
    }

    return next();
}

// @desc    required accessLevel is higher than Spectator
export const hasLevel3Access = async (req, res, next) => {
    hasLevel2Access(req, res, () => {
        if (req.user.accessLevel === L2) {
            return next(new ResponseError("Not Authorized To Access This Route", 403));
        }

        return next();
    });
}
// @desc    required accessLevel is Administrator
export const isAdmin = async (req, res, next) => {
    if (req.user.accessLevel !== ADMIN) {
        return next(new ResponseError("Not Authorized To Access This Route", 403));
    }

    return next();
}