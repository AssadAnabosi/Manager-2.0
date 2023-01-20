import mongoose from "mongoose";

const BillSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: [true, "Please provide a date"]
    },
    value: {
        type: Number,
        required: [true, "Please provide a value"]
    },
    description: {
        type: String,
        required: [true, "Please provide a description"]
    },
    extraNotes: {
        type: String,
        required: false
    }
});

const Bill = mongoose.model("Bill", BillSchema);

export default Bill;