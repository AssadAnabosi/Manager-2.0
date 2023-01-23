import mongoose from "mongoose";
import Payee from "./Payee.model.js";

const ChequeSchema = new mongoose.Schema({
    serial: {
        type: Number,
        required: [true, "Please provide a serial"],
        unique: true
    },
    dueDate: {
        type: Date,
        required: [true, "Please provide a due date"]
    },
    value: {
        type: Number,
        required: [true, "Please provide a value"],
        min: [0, "Value must be greater than 0"]
    },
    description: {
        type: String,
        required: false
    },
    payee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payee",
    },
    isCanceled: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },

});

// @desc    Set the isDeleted property to false if the payee is while it's true
ChequeSchema.pre("save", async function (next) {
    if (this.isModified("payee") && this.isDeleted) {
        this.isDeleted = false;
    }
    next();
});

// @desc    Add the cheque to the payee's cheques array when the cheque is created
ChequeSchema.post("save", async function (cheque) {
    await Payee.updateOne({ _id: cheque.payee }, { $push: { cheques: cheque._id } });
});

// @desc   Remove the cheque from the payee's cheques array when the cheque is deleted
ChequeSchema.post("findOneAndDelete", async function (cheque) {
    await Payee.updateOne({ _id: cheque.payee }, { $pull: { cheques: cheque._id } });
});


const Cheque = mongoose.model("Cheque", ChequeSchema);

export default Cheque;
