import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    otp: {
        type: String,
        required: true,
    },

    otpExpiry: {
        type: Date,
    },

    otpVerify: {
        type: Boolean,
        default: false,
    },

    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true

    }


}, {timestamps: true})



export const Otp = mongoose.model("Otp", otpSchema)