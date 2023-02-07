import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import capitalizeFirstLetter from "../utils/capitalizeFirstLetter.js";
import accessLevels, { L1 } from "../constants/accessLevels.js";
import ms from "ms";
import Log from "./Log.model.js";

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Please provide a first name"],
  },
  lastName: {
    type: String,
    required: [true, "Please provide a last name"],
  },
  username: {
    type: String,
    required: [true, "Please provide a username"],
    unique: true,
  },
  email: {
    type: String,
    // required: [true, "Please provide an Email"],
    // unique: true,
    required: false,
    unique: false,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please provide a valid email",
    ],
  },
  phoneNumber: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
  },
  accessLevel: {
    type: String,
    enum: accessLevels,
    default: L1,
  },
  active: {
    type: Boolean,
    default: true,
  },
  logs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Log",
    },
  ],
});

// @desc    Create a virtual field "fullName" that combines the first and last name
UserSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// @desc    Hash the password and capitalize the first letter of the first and last name before saving the user
UserSchema.pre("save", async function (next) {
  this.username = this.username.toLocaleLowerCase();
  // if password is NOT modified, then don't hash the hashed value
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  if (this.isModified("firstName")) {
    this.firstName = capitalizeFirstLetter(this.firstName);
  }
  if (this.isModified("lastName")) {
    this.lastName = capitalizeFirstLetter(this.lastName);
  }
  if (this.isModified("email")) {
    this.email = this.email.toLocaleLowerCase();
  }
  return next();
});

UserSchema.set("toJSON", {
  // @desc    send the virtual field "fullName" in the response of a find query
  virtuals: true,
  // @desc    remove the firstName and lastName fields and don't include the id field
  transform: function (doc, ret) {
    delete ret.firstName;
    delete ret.lastName;
    delete ret.id;
    delete ret.__v;
  },
});

// @desc    Check if password matches hashed password
UserSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// @desc    Generate an access token
UserSchema.methods.getAccessToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRE,
  });
};

// @desc    Generate a refresh token
UserSchema.methods.getRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.MAX_AGE,
  });
};

// @desc   Delete all logs associated with the user when the user is deleted
UserSchema.post("findOneAndDelete", async function (user) {
  await Log.deleteMany({ worker: user._id });
});

const User = mongoose.model("User", UserSchema);

export default User;
