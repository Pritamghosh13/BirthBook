import { User } from "../models/user.model.js";
import { ApiError } from "../utilis/apiError.js";
import { ApiResponse } from "../utilis/apiResponse.js";
import { asyncHandler } from "../utilis/asyncHandeller.js";


const getBirthInThisMonth = asyncHandler(async (req, res) => {
    const days = 30;

    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days)

    const users = await User.find().select("-refreshToken -profile_image -public_id -password -phone_number -isVerified")

    if(users.length === 0){
        throw new ApiError(404, "Users not found in DB")
    }

    const upcomingBirth = users.filter((user) => {
        const dob = new Date(user.dob);

        const nextBirthday = new Date(
            today.getFullYear(),
            dob.getMonth(),
            dob.getDate()
        )

        if(nextBirthday < today){
            nextBirthday.setFullYear(today.getFullYear() + 1)
        }

        return (nextBirthday >= today) && (nextBirthday <= futureDate)
    })



    console.log(upcomingBirth);
    

    return res.status(200)
    .json(new ApiResponse(200, upcomingBirth, "Birthday of this Month fetch successfully"))


})



// const ageCalculate = (dob) => {
//     const birthday = new Date(dob);
//     const today = new Date();

//     const age = today.getFullYear() - birthday.getFullYear();

//     const birthMonth = today.getMonth() - birthday.getMonth();

//     if(birthMonth < 0 ||(( birthMonth === 0) &&(today.getDay() < birthday.getDay()))){
//         age--;
//     }

//     return age;
// }


// const getAge = asyncHandler(async(req, res) => {

//     const users = await User.find().select("-refreshToken -profile_image -public_id -password -phone_number -isVerified")

//     if (!users) {
//         throw new ApiError(404, "Users data not fetched successfully")
//     }

//     users.forEach()

// })






export {getBirthInThisMonth,
}