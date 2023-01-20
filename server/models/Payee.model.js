import mongoose from "mongoose";

const PayeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide a name"],
        unique: true,
    },
    email: {
        type: String,
        required: false
    },
    phoneNumber: {
        type: String,
        required: false
    },
    extraNotes: {
        type: String,
        required: false
    },
});

const Payee = mongoose.model("Payee", PayeeSchema);

export default Payee;
