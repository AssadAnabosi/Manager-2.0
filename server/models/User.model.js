import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import capitalizeFirstLetter from "../utils/capitalizeFirstLetter.js";
import userRoles, { USER } from "../utils/constants/userRoles.js";
import {
  THEMES,
  LANGUAGES,
  SYSTEM,
  AR,
} from "../utils/constants/preferences.js";

const UserSchema = new Schema({
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
  role: {
    type: String,
    enum: userRoles,
    default: USER,
  },
  active: {
    type: Boolean,
    default: true,
  },
  theme: {
    type: String,
    enum: THEMES,
    default: SYSTEM,
  },
  language: {
    type: String,
    enum: LANGUAGES,
    default: AR,
  },
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
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
  },
});

// @desc    Check if password matches hashed password
UserSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// @desc    Generate an access token
UserSchema.methods.getAccessToken = function (sessionId) {
  return jwt.sign(
    { id: this._id, sessionId: sessionId },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRE,
      issuer: process.env.DOMAIN_URL,
    }
  );
};

// @desc    Generate a refresh token
UserSchema.methods.getRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.MAX_AGE,
    issuer: process.env.DOMAIN_URL,
  });
};

const User = model("User", UserSchema);

export default User;
