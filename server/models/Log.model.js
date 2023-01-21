import mongoose from "mongoose";
import User from "./User.model.js";

const LogSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: [true, "Please provide a date"]
    },
    isAbsence: {
        type: Boolean,
        default: false
    },
    startingTime: {
        type: String,
        required: false
    },
    finishingTime: {
        type: String,
        required: false
    },
    payment: {
        type: Number,
        default: 0,
        required: false
    },
    extraNotes: {
        type: String,
        required: false
    },
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Please specify a worker"],
    },
});

// @desc    Date and worker must be a composite unique value
LogSchema.index({ date: 1, worker: 1 }, { unique: true });

// @desc   Virtual property that calculates the OTV
LogSchema.virtual("OTV").get(function () {
    const log = this;
    const startingTime = log.startingTime.split(":");
    const finishingTime = log.finishingTime.split(":");
    const hours = parseInt(finishingTime[0]) - parseInt(startingTime[0]);
    const minutes = parseInt(finishingTime[1]) - parseInt(startingTime[1]);
    return hours + minutes - 8;
});


LogSchema.set("toJSON", {
    // @desc    send the virtual field "OTV" in the response of a find query
    virtuals: true,
    // @desc    remove the id from the response
    transform: function (doc, ret) {
        delete ret.id;
    },
});

// @desc    Add the log to the worker's logs array when the log is created
LogSchema.post("save", async function (log) {
    const worker = await User.findById(log.worker);
    worker.logs.push(log._id);
    await worker.save();
});

// @desc    Remove the log from the worker's logs array when the log is deleted
LogSchema.post("findOneAndDelete", async function (log) {
    const worker = await User.findById(log.worker);
    if (!worker) return;
    worker.logs = worker.logs.filter(logId => logId.toString() !== log._id.toString());
    await worker.save();
});


const Log = mongoose.model("Log", LogSchema);

export default Log;
