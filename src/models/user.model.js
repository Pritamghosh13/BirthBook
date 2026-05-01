import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import dotenv from "dotenv"
import jwt from "jsonwebtoken"



dotenv.config({
    path: './.env'
})



const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
       
    },

    phone_number: {
        type: String,
        required: true,
    },

    dob: {
    type: Date,
    required: true
    },

    refreshToken: {
        type: String,
    },
    
    isVerified: {
        type: Boolean,
        default: false,
    },

    profile_image: {
        type: String,
        default: ""
    },

    public_id: {
        type: String,
        default: ""

    }



},
{timestamps: true})






//encypt the password
userSchema.pre("save", async function (){
    
    if(!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10)
    
})


//checking the password
userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password, this.password)
}



//generating access_token.
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
        
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIREY
        }
    )
}



//generating Refresh_token.
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,

        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIREY
        }
    )
}



export const User = mongoose.model("User", userSchema)
