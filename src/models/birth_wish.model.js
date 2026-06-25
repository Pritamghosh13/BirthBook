import mongoose, { trusted } from "mongoose";

const wishSchema = new mongoose.Schema(
{

    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },


    message: {
        type: String,
        trim: true,
        required: true
    }



}, 
{timestamps: true})


export const Wish = mongoose.model("Wish", wishSchema)