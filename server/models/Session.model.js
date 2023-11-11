import { Schema, model } from "mongoose";

const SessionSchema = new Schema({
  refreshToken: {
    type: String,
    required: [true, "Please provide a refresh token"],
    unique: true,
  },
  ipAddress: {
    type: String,
    required: [true, "Please provide an IP address"],
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  expiresAt: {
    type: Date,
    required: [true, "Please provide an expiration date"],
  },
});

const Session = model("Session", SessionSchema);

export default Session;
