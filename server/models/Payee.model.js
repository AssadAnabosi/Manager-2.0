import mongoose from "mongoose";
import Cheque from "./Cheque.model.js";

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
    cheques: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cheque",
        },
    ]
});

// @desc   set isDeleted property to true and set the payee's cheques' payee property to null in the associated cheques
PayeeSchema.post("findOneAndDelete", async function (payee) {
    await Cheque.updateMany({ payee: payee._id }, { payee: null, isDeleted: true });
});

const Payee = mongoose.model("Payee", PayeeSchema);

export default Payee;
