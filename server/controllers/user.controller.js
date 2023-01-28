import User from "../models/User.model.js";
import ResponseError from "../utils/ResponseError.js";

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
    if (req.body.password || req.body.accessLevel || req.logs || req.body.active)
        return next(new ResponseError("You are not authorized to update this field", 400));

    try {
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
    if (req.params.id === req.user.id) {
        return next(new ResponseError("You are not authorized to delete your own account", 400));
    }

    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user)
            return next(new ResponseError("User not found", 404));

        return res.sendStatus(204);
    } catch (error) {
        next(error);
    }
}

// @desc    User changing own password
export const changePassword = async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return next(new ResponseError("Please provide current and new passwords", 400));
    }

    try {
        const user = await User.findById(req.user.id).select("+password");
        if (!user) {
            return next(new ResponseError("User not found", 404));
        }

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return next(new ResponseError("Wrong current password", 400));
        }

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
        const user = await User.findOne({ username });
        const isAvailable = user ? false : true;

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

// @desc    Reset a user's password by an administrator
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

// @desc   Change user's access level (authorization)
export const setAccessLevel = async (req, res, next) => {
    if (req.params.id === req.user.id) {
        return next(new ResponseError("You are not authorized to change your access level", 400));
    }
    
    const accessLevels = ["User", "Spectator", "Moderator", "Administrator"];
    const { accessLevel } = req.body;
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

// @desc    Deactivate or Activate a user account
export const setActiveStatus = async (req, res, next) => {
    if (req.params.id === req.user.id) {
        return next(new ResponseError("You are not authorized to deactivate your own account", 400));
    }

    const { active } = req.body;
    if (active === null || active === undefined)
        return next(new ResponseError("Please provide active status", 400));

    try {
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