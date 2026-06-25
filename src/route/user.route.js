import { Router } from "express";
import { registerUser, userDetails, userLogin, userLogout, uploadProfileImage, deleteProfileImage, changePassword, forgetUserPassword, deleteUserAccount, updateProfile } from "../controllers/user.controllers.js";
import { verifyJWT } from "../middleWare/auth.middleware.js";
import { ApiResponse } from "../utilis/apiResponse.js";
import { sendOtp, verifyOtp } from "../controllers/otp.controllers.js";
import { upload } from "../middleWare/multer.middleware.js";
import { getBirthInThisMonth } from "../controllers/birrth.controllers.js";
import { getAllWishes, makeWish } from "../controllers/Birth_wish.controllers.js";


const router = Router()


router.route("/register").post(registerUser)

router.route("/login").post(userLogin)


router.route("/logout").post(verifyJWT , userLogout)

router.route("/userinfo").get(userDetails)


// router.route("/sendmail").get(send_mail_to_user)


router.route("/sendotp").post(sendOtp)

router.route("/verifyotp").post(verifyOtp)


router.route("/me").get(verifyJWT, (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

router.route("/profile/update").put(verifyJWT, updateProfile)

router.route("/profile/upload").post(verifyJWT, upload.single("profilePic"), uploadProfileImage)


router.route("/profile/delete-image").delete(verifyJWT, deleteProfileImage)

router.route("/change-pass").post(verifyJWT, changePassword)

router.route("/forgot-pass").post(forgetUserPassword)

router.route("/delete/account").post(verifyJWT, deleteUserAccount)


router.route("/birth/month").get(verifyJWT, getBirthInThisMonth)


router.route("/wish/add").post(verifyJWT , makeWish)

router.route("/wish/getAll").get(verifyJWT, getAllWishes)


export {router}