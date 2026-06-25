import { User } from "../models/user.model.js";
import { asyncHandler } from "../utilis/asyncHandeller.js";
import { ApiError } from "../utilis/apiError.js";
import { ApiResponse } from "../utilis/apiResponse.js";
import { Wish } from "../models/birth_wish.model.js";



const makeWish = asyncHandler(async(req, res) => {
    const { receiverId, message } = req.body;

    if(!receiverId || !message){
        throw new ApiError(401, "receiverId or message is required");
    }

    if(message.length > 300){
        throw new ApiError(400, "Message cannot exceed 300 characters")
    }


    if(receiverId === req.user._id.toString()){
        throw new ApiError(400, "You cannot wish yourself")
    }

    const receiver = await User.findById(receiverId);

    if (!receiver) {
    throw new ApiError(404, "Receiver not found");
    }

    const today = new Date();

    if (!receiver?.dob) {
    throw new ApiError(400, "Receiver DOB not found");
    }

    const isBirthday =
        receiver.dob.getDate() === today.getDate() &&
        receiver.dob.getMonth() === today.getMonth();

    if (!isBirthday) {
        throw new ApiError(400, "Today is not this user's birthday");
    }

    const alreadyWish = await Wish.findOne({
        sender: req.user._id,
        receiver: receiverId
    })

    if(alreadyWish){
        throw new ApiError(401, "You already wish your friend")
    }





    const wish = await Wish.create({
        sender: req.user._id,
        receiver: receiverId,
        message: message
    })

    return res.status(200)
    .json(new ApiResponse(200, wish, "WIsh created successfully"))
    
})












const getAllWishes = asyncHandler(async (req, res) => {
    const wishes = await Wish.find({
        receiver: req.user?._id
    }).populate("sender", "fullname public_id profile_image")
    .sort({ createdAt : -1})

    if(wishes.length === 0){
        throw new ApiError(400, "No wishes found")
    }

    return res.status(200)
    .json(new ApiResponse(200, wishes, "HAPPY BIRTHDAY, all wishes fetched successfully"))


})



export {
    getAllWishes,
    makeWish
}