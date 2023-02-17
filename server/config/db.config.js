import mongoose from "mongoose";
import User from "../models/User.model.js";
import { ADMIN } from "../utils/constants/accessLevels.js";

const connectDB = async () => {
  // @desc: Connection string
  const MONGO_URI = process.env.MONGO_URI;
  mongoose.set("strictQuery", false);
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
  mongoose.connect(MONGO_URI, options);

  console.log("Connection to the Database was established successfully 🌍");

  createAdmin();
};

// @desc: Create an admin user if there are no Admin users in the database
const createAdmin = async () => {
  mongoose.connection.once("open", async () => {
    const count = await User.countDocuments({
      accessLevel: ADMIN,
    }).exec();
    if (count === 0) {
      const Admin = {
        firstName: process.env.ADMIN_FIRSTNAME || "Administrator",
        lastName: process.env.ADMIN_LASTNAME || "Alpha",
        username: process.env.ADMIN_USERNAME || "admin",
        email: process.env.ADMIN_EMAIL || "",
        phoneNumber: process.env.ADMIN_PHONE_NUMBER || "",
        password: process.env.ADMIN_PASSWORD || "12345678",
        accessLevel: ADMIN,
      };
      try {
        const user = new User(Admin);
        await User.create(user);
        console.log("Admin Username: " + Admin.username);
        console.log("Admin Password: " + Admin.password);
      } catch (error) {
        console.log(error);
      }
    }
  });
};

export default connectDB;
