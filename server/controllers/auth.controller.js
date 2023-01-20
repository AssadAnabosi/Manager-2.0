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