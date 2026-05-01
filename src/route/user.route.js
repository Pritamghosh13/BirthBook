import { Router } from "express";
import { registerUser, userDetails, userLogin, userLogout } from "../controllers/user.controllers.js";
import { verifyJWT } from "../middleWare/auth.middleware.js";
import { sendOtp, verifyOtp } from "../controllers/otp.controllers.js";


const router = Router()


router.route("/register").post(registerUser)

router.route("/login").post(userLogin)


router.route("/logout").post(verifyJWT , userLogout)

router.route("/userinfo").get(userDetails)


// router.route("/sendmail").get(send_mail_to_user)


router.route("/sendotp").post(sendOtp)

router.route("/verifyotp").post(verifyOtp)


export {router}