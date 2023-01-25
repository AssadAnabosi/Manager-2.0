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
    isCancelled: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },

});

ChequeSchema.index({ dueDate: 1, serial: 1 });

// @desc    Update the corresponding payees' cheques array when the cheque payee is updated
ChequeSchema.pre("findOneAndUpdate", async function (next) {
    // if payee is modified
    if (this._update.payee) {
        // get the current cheque
        let currentCheque = await Cheque.findById(this._conditions);
        // pull the cheque from the old payee's cheques array
        await Payee.updateOne({ _id: currentCheque.payee }, { $pull: { cheques: currentCheque._id } });
        // push the cheque to the new payee's cheques array 
        await Payee.updateOne({ _id: this._update.payee }, { $push: { cheques: currentCheque._id } });
        // if isDeleted then set it to false
        if (currentCheque.isDeleted) {
            this.isDeleted = false;
        }
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
