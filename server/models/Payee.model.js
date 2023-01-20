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
    cheques: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cheque",
        },
    ]
});

// @desc   set isDeleted property to true and set the payee's cheques' payee property to null in the associated cheques
PayeeSchema.post("findOneAndDelete", async function (payee) {
    if (payee.cheques.length === 0) return;
    payee.cheques.forEach(async (chequeId) => {
        const cheque = await Cheque
            .findByIdAndUpdate(chequeId, { payee: null, isDeleted: true }, { new: true, runValidators: true });
        await cheque.save();
    });
});

const Payee = mongoose.model("Payee", PayeeSchema);

export default Payee;
