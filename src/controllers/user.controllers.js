import { User } from "../models/user.model.js";
import { asyncHandler } from "../utilis/asyncHandeller.js";
import {ApiError} from "../utilis/apiError.js"
import {ApiResponse} from "../utilis/apiResponse.js"
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer"
import dotenv from "dotenv";
import { sendWelcomeEmail } from "../mailer/mailService.js";
import cookieParser from "cookie-parser";
import { uploadOnCloudinary } from "../utilis/cloudinary.js";

dotenv.config({
    path: './.env'
})


//generating access and refresh access_token
const generatingAccessTokenAndRefreshToken = async (userId) => {
 try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken  = refreshToken;
    await user.save({validateBeforeSave: false})

    return {accessToken, refreshToken}


 } catch (err) {
    console.log(err);
    throw new ApiError(500, "Something went wrong while generating access and refresh token")
    
 }
}



//registering a user
const registerUser = asyncHandler(async (req, res) => {
    const {fullname, email, password, phone_number, dob} = req.body

    // console.log(fullname);
    // console.log(email);
    // console.log(password);
    // console.log(phone_number);
    // console.log(dob);
    

    if (
        [fullname, email, password, phone_number, dob].some((field) =>!field || field?.trim() ==="")
    ) {
        throw new ApiError(400, "All fields are required")
    }


    const excitedUser = await User.findOne(
        {
            email
        }
    )

    if (excitedUser) {
        throw new ApiError(409, "User with this email already exists")
    }


    // const user = await User.create({
    //     fullname,
    //     email,
    //     password,  //passeword automatic encrypt hoye jabe.
    //     phone_number,
    //     dob,
        
    // })

    
    const user = new User(req.body)
    await user.save()   

    const createdUser = await User.findById(user._id).select("-password -phone_number")

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    // await sendWelcomeEmail(createdUser.email, createdUser.fullname)


    return res.status(200)
    .json(new ApiResponse(
        200,
        createdUser,
        "User Registered successfully"

    ))
})



//log in a user
const userLogin = asyncHandler(async(req, res) => {
    const {email, password} = req.body;

    //checking for all fileds are filled
    if (
        [email, password].some((field) =>!field || field?.trim() ==="")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findOne({email})

    if (!user) {
        // console.log(401,"User Not Found");
        throw new ApiError(404, "User is not exists");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const {accessToken, refreshToken} = await generatingAccessTokenAndRefreshToken(user._id)

    const loginUser = await User.findById(user._id).select("-password -refreshToken")


    const options = {
    httpOnly: true,
    secure: false,      
};

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(
        200,
        loginUser,
        "User logged in successfully"
    ))

})



//logOut a user
const userLogout = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: { refreshToken: 1 }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(
        200,
        {},
        "User successfully logged out"
    ))
})



//Access a new refresh token
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request") 
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken, 
            process.env.REFRESH_SECRET_TOKEN
        )
    
        
        const user = await User.findById(decodedToken._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token") 
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used") 
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {
                    accessToken, 
                    refreshToken: newRefreshToken,
                },
                "Access token refreshed"
            )
        )
    } catch (err) {
        throw new ApiError(401, err?.message || "Invalid refresh token")
    }
})


//get user details
const userDetails = asyncHandler(async(req, res) => {
    const users = await User.find().select("-password -refreshToken -phone_number")

    if (!users || users.length === 0) {
        throw new ApiError(404, "User is not found");
    }

    console.log(users);

    return res.status(200)
    .json(new ApiResponse(200, 
        users,
        "User found successfully"
    ))

    
    

})



//Upload profile_image

const uploadProfileImage = asyncHandler(async(req, res) => {
    try {
        const localFilePath = req.file?.path;

        if(!localFilePath){
            throw new ApiError(400, "File is required");
        }

        //upload on cloudinary
        const result = await uploadOnCloudinary(localFilePath)

        if(!result){
            throw new ApiError(500, "Image upload failed");
        }

        // console.log(result.url);
        // console.log(result.public_id);
        

        //save url in DB.
        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    profile_image: result.url,
                public_id: result.public_id
                }
            },
            {
                new: true
            }
        )

        return res.status(200)
        .json(new ApiResponse(200, {}, "Image uploaded Successfully"))

    } catch (error) {
        
    }
})


//sending mail to user
// const send_mail_to_user = asyncHandler(async (req, res) => {
//     try {
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: "curlyhair12y@gmail.com",
//       subject: "⏳ BirthBook is Coming Soon! Get Ready",
//       text: "Hey there!\n\nSomething exciting is on the way 🎉\n\nBirthBook is being built to help you track birthdays and never miss special moments 🎂\n\nWe’re almost ready 🚀\n\n👉 Get ready to register as soon as we launch!\n\nStay tuned 💙\n\n- BirthBook Team",
//     };

//     const info = await transporter.sendMail(mailOptions);
//     console.log(info);
    
//     res.send("Email sent: " + info.response);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send("Error sending email");
//   }
// })





export {registerUser,
    userLogin,
    userLogout,
    refreshAccessToken,
    userDetails,
    // send_mail_to_user,
    uploadProfileImage


}