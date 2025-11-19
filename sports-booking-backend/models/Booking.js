const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
    studentName: {
        type: String,
        required: true
    },
    studentEmail: {
        type: String,
        required: true
    },
    courtId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Court",
        required: true
    },
    date: {
        type: String,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    
    teamMembers: {
    type: String,
    default: ""
},

    // REMOVE END TIME
    status: {
        type: String,
        enum: ["pending", "approved", "rejected","blocked"],
        default: "pending"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Booking", BookingSchema);
