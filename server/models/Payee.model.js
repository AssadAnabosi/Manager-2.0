import { Schema, model } from "mongoose";

const PayeeSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    unique: true,
  },
  email: {
    type: String,
    required: false,
  },
  phoneNumber: {
    type: String,
    required: false,
  },
  extraNotes: {
    type: String,
    required: false,
  },
});

PayeeSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
  },
});

const Payee = model("Payee", PayeeSchema);

export default Payee;
