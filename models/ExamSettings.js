const mongoose = require("mongoose");

const examSettingsSchema = new mongoose.Schema({

    controllerOfficer: {
        type: String,
        required: true
    },

    officialHelpline: {
        type: String,
        required: true
    },

    deskEmail: {
        type: String,
        required: true
    },

    officeHours: {
        type: String,
        required: true
    },

    googleMap: {
        type: String,
        required: true
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("ExamSettings", examSettingsSchema);