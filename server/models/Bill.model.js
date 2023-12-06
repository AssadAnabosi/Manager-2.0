import { Schema, model } from "mongoose";

const BillSchema = new Schema({
  date: {
    type: Date,
    required: [true, "Please provide a date"],
  },
  value: {
    type: Number,
    required: [true, "Please provide a value"],
  },
  description: {
    type: String,
    required: [true, "Please provide a description"],
  },
  remarks: {
    type: String,
    required: false,
  },
});

BillSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
  },
});

const Bill = model("Bill", BillSchema);

export default Bill;
