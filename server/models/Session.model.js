import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema({
    refreshToken: {
        type: String,
        required: [true, "Please provide a refresh token"],
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    expiresAt: {
        type: Date,
        required: [true, "Please provide an expiration date"],
    }
});

const Session = mongoose.model("Session", SessionSchema);

export default Session;
