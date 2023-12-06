import { Schema, model } from "mongoose";

const ChequeSchema = new Schema({
  serial: {
    type: Number,
    required: [true, "Please provide a serial"],
    unique: true,
  },
  dueDate: {
    type: Date,
    required: [true, "Please provide a due date"],
  },
  value: {
    type: Number,
    required: [true, "Please provide a value"],
    min: [0, "Value must be greater than 0"],
  },
  remarks: {
    type: String,
    required: false,
  },
  payee: {
    type: Schema.Types.ObjectId,
    ref: "Payee",
  },
  isCancelled: {
    type: Boolean,
    default: false,
  },
});

ChequeSchema.index({ dueDate: 1, serial: 1 });

ChequeSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
  },
});

const Cheque = model("Cheque", ChequeSchema);

export default Cheque;
