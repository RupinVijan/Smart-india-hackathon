const mongoose = require("mongoose");

const users = mongoose.Schema({
	name: {
		type: String
	},
	email: {
		type: String,
		unique: true
	},
	password: {
		type: String
	},
	userLogin: {
		type: String,
		default: 'isUser'
	},
	isVerified: {
		type: Boolean
	},
	aadharNumber: {
		type: String
	},
	role: {
		type: String,
		default: 'user'
	},
	OTP: {
		type: Number
	}
});
module.exports = mongoose.model("users", users);