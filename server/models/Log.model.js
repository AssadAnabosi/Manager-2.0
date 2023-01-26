import mongoose from "mongoose";
import User from "./User.model.js";

const LogSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: [true, "Please provide a date"]
    },
    isAbsent: {
        type: Boolean,
        default: false
    },
    startingTime: {
        type: String,
        required: false,
        default: "00:00"
    },
    finishingTime: {
        type: String,
        required: false,
        default: "00:00"
    },
    OTV: {
        type: Number,
        default: 0,
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
LogSchema.index({ date: -1, worker: 1 }, { unique: true });

// @desc    set startingTime and finishingTime to 00:00 if isAbsent is true
LogSchema.pre("save", async function (next) {
    const { isAbsent } = this;
    if (isAbsent) {
        this.startingTime = "00:00";
        this.finishingTime = "00:00";
        this.OTV = 0;
    } else {
        const { startingTime, finishingTime } = this;
        const [startingHour, startingMinute] = startingTime.split(":");
        const [finishingHour, finishingMinute] = finishingTime.split(":");
        const OTV = (finishingHour - startingHour) + ((finishingMinute - startingMinute) / 60) - 8;
        this.OTV = OTV;
    }
    next();
});


// @desc    set startingTime and finishingTime to 00:00 if isAbsent is true
LogSchema.pre("findOneAndUpdate", async function (next) {
    let { isAbsent, startingTime, finishingTime } = this._update;
    if (isAbsent) {
        this._update.startingTime = "00:00";
        this._update.finishingTime = "00:00";
        this._update.OTV = 0;
    } else if (startingTime && finishingTime) {
        const [startingHour, startingMinute] = startingTime.split(":");
        const [finishingHour, finishingMinute] = finishingTime.split(":");
        const OTV = (finishingHour - startingHour) + ((finishingMinute - startingMinute) / 60) - 8;
        this._update.OTV = OTV;
    }
    next();
});


// @desc    Add the log to the worker's logs array when the log is created
LogSchema.post("save", async function (log) {
    await User.updateOne({ _id: log.worker }, { $push: { logs: log._id } });
});

// @desc    Remove the log from the worker's logs array when the log is deleted
LogSchema.post("findOneAndDelete", async function (log) {
    await User.updateOne({ _id: log.worker }, { $pull: { logs: log._id } });
});


const Log = mongoose.model("Log", LogSchema);

export default Log;
