import { Otp } from "../models/otp.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utilis/apiError.js";
import { ApiResponse } from "../utilis/apiResponse.js";
import { asyncHandler } from "../utilis/asyncHandeller.js";
import { sendOtpEmail } from "../mailer/mailService.js";
import bcrypt from "bcrypt"


//sending OTP.
const sendOtp = asyncHandler(async (req, res) => {
    const {email} = req.body

    // const email = email.trim().toLowerCase();

    if(!email){
        throw new ApiError(409, "Email not found");    
    }

    const user = await User.findOne({email})


    if (!user) {
        throw new ApiError(404, "User not found");
    }

    await Otp.deleteMany({email});  //deleting privious otp.

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedOTP = await bcrypt.hash(otp, 10)

    const optModel = await Otp.create({
        email,
        otp: hashedOTP,
        otpExpiry: Date.now() + (5 * 60 * 1000),

    })

    await sendOtpEmail(email, otp);

    return res.status(200)
    .json(new ApiResponse(200, "OTP send successfully"));


})


//get otp
// const getOTP = asyncHandler(async(req, res) => {
//     const {email} = req.body;

//     if(!email){
//         throw new ApiError(404, "Email not found");

//     }
// })

//verifying otp
const verifyOtp = asyncHandler(async(req, res) => {
    const {email, otp} = req.body;
    // const email = email.trim().toLowerCase();

    console.log(email);
    console.log(otp);
    

    const record = await Otp.findOne({email})
    

    if(!record){
        throw new ApiError(404, "No OTP found");
    }
    
    if(record.otpExpiry < Date.now()){
        throw new ApiError(400, "Invalid or Expired otp");
    }

    const compareOTP = await bcrypt.compare(otp, record.otp)

    if (!compareOTP) {
        throw new ApiError(400, "Invalid OTP");
    }

    await Otp.deleteOne({email});

    // await Otp.updateOne({email}, {
    //     otpVerify: true
    // })

    
    await User.updateOne({email}, {
        isVerified: true,
    })

     
    return res.status(200)
    .json(new ApiResponse(200, {}, "OTP verify successfully"))
})

export {
    sendOtp,
    verifyOtp,
}