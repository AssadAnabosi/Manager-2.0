import mongoose from "mongoose";

const connectDB = async () => {
    // @desc: Connection string 
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/';
    mongoose.set("strictQuery", false);
    const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
    await mongoose.connect(MONGO_URI, options);

    console.log("Connection to the Database was established successfully 🌍");
}
export default connectDB;