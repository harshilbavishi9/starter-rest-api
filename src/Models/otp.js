const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    otp: {
        type: String,
        require: false
    },
    email: {
        type: String,
        require: false
    },
    expireTime: {
        type: Number,
        require: false
    }
}, { timeStamps: true })

const OTP = mongoose.model("otps", otpSchema)

module.exports = OTP