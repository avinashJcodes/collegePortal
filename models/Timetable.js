const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema({

    examName: {
        type: String,
        required: true
    },

    academicYear: {
        type: String,
        required: true
    },

    branch: {
        type: String,
        required: true
    },

    semester: {
        type: Number,
        required: true
    },

    subjectCode: {
        type: String,
        required: true
    },

    subjectName: {
        type: String,
        required: true
    },

    examDate: {
        type: Date,
        required: true
    },

    startTime: {
        type: String,
        required: true
    },

    endTime: {
        type: String,
        required: true
    },

    examHall: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ["Upcoming", "Completed", "Cancelled"],
        default: "Upcoming"
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Timetable", timetableSchema);