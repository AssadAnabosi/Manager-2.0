import User from "../models/User.model.js";
import ResponseError from "../utils/ResponseError.js";

// @desc    Get all users
export const getUsers = async (req, res, next) => {
    try {
        const users = await User.find().select("-logs");
        return res.status(200).json({
            success: true,
            data: users,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get a user
export const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return next(new ResponseError("User not found", 404));
        }
        return res.status(200).json({
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
        if (req.body.password || req.body.accessLevel || req.logs)
            return next(new ResponseError("You are not authorized to update this field", 401));
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!user)
            return next(new ResponseError("User not found", 404));
        return res.sendStatus(204);
    } catch (error) {
        next(error);
    }
}

// @desc    Delete a user
export const deleteUser = async (req, res, next) => {
    try {
        if (req.params.id === req.user.id) {
            return next(new ResponseError("You are not authorized to delete your own account", 401));
        }
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user)
            return next(new ResponseError("User not found", 404));
        return res.sendStatus(204);
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

// @desc    Check the availability of a username
export const checkUsername = async (req, res, next) => {
    const { username } = req.body;
    try {
        const
            user = await User.findOne
                ({ username }),
            isAvailable = user ? false : true;
        return res
            .status(200)
            .json({
                success: true,
                data: isAvailable
            });
    } catch (error) {
        next(error);
    }
}

// @desc    Reset a user's password
export const resetPassword = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user)
            return next(new ResponseError("User not found", 404));
        user.password = req.body.password;
        await user.save();
        return res.sendStatus(204);
    } catch (error) {
        next(error);
    }
}

// @desc    Update a user's access level
export const updateAccessLevel = async (req, res, next) => {
    const accessLevels = ["User", "Spectator", "Moderator", "Administrator"];
    const accessLevel = req.body.accessLevel;
    if (!accessLevels.includes(accessLevel))
        return next(new ResponseError("Invalid access level", 400));
    try {
        const user = await User.findById(req.params.id);
        if (!user)
            return next(new ResponseError("User not found", 404));
        user.accessLevel = accessLevel;
        await user.save();
        return res.sendStatus(204);
    } catch (error) {
        next(error);
    }
}

// @desc    set a user's active status
export const setActiveStatus = async (req, res, next) => {
    try {
        const { active } = req.body;
        if (active === null || active === undefined)
            return next(new ResponseError("Please provide active status", 400));
        const user = await User.findByIdAndUpdate(req.params.id, { active }, {
            new: true,
            runValidators: true
        });
        if (!user)
            return next(new ResponseError("User not found", 404));
        return res.sendStatus(204);
    } catch (error) {
        next(error);
    }
}