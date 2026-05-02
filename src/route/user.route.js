import { Router } from "express";
import { registerUser, userDetails, userLogin, userLogout, uploadProfileImage, deleteProfileImage, changePassword, forgetUserPassword, deleteUserAccount } from "../controllers/user.controllers.js";
import { verifyJWT } from "../middleWare/auth.middleware.js";
import { sendOtp, verifyOtp } from "../controllers/otp.controllers.js";
import { upload } from "../middleWare/multer.middleware.js";


const router = Router()


router.route("/register").post(registerUser)

router.route("/login").post(userLogin)


router.route("/logout").post(verifyJWT , userLogout)

router.route("/userinfo").get(userDetails)


// router.route("/sendmail").get(send_mail_to_user)


router.route("/sendotp").post(sendOtp)

router.route("/verifyotp").post(verifyOtp)


router.route("/profile/upload").post(verifyJWT, upload.single("profilePic"), uploadProfileImage)


router.route("/profile/delete-image").delete(verifyJWT, deleteProfileImage)

router.route("/change-pass").post(verifyJWT, changePassword)

router.route("/forgot-pass").post( forgetUserPassword)

router.route("/delete/account").post(verifyJWT, deleteUserAccount)


export {router}