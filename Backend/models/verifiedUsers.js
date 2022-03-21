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
    userLogin:{
        type:String,
        default:'isUser'
    },
	isVerified:{
        type:Boolean
    },
	aadharNumber:{
		type:String
	}
});
module.exports = mongoose.model("users", users);