const mongoose = require("mongoose");

const schemes = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    eligibility: {
        type: String,
        required: true
    },
    img: {
        type: String,
    },
    agency: {
        type: String,
        required: true
    },
    applicants: {
        type: [mongoose.Schema.ObjectId],
        ref: 'users',
        default: []
    },
    approved: {
        type: [mongoose.Schema.ObjectId],
        ref: 'users',
        default: []
    }
});
module.exports = mongoose.model("schemes", schemes);