import { transporter } from "./send_mail.js";
import { welcomeEmailTemplate } from "./tamplates/welcome.mailer.js";
import { otpEmailTemplate } from "./tamplates/otp.mailer.js";
import { birthdayEmailTemplate } from "./tamplates/Birthday.mailer.js";
import dotenv from "dotenv"

dotenv.config({path: "./.env"})


// welcome
export const sendWelcomeEmail = (email, name) => {
    console.log("Email send successfully");
    return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "🎉 Welcome to BirthBook",
    html: welcomeEmailTemplate(name),
  });
  
};

// otp
export const sendOtpEmail = (email, otp) => {
    console.log("Email send successfully");
    return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "🔐 Verify your email",
    html: otpEmailTemplate(otp),
  });
};

// birthday
export const sendBirthdayEmail = (email, name) => {
    console.log("Email send successfully");
    return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "🎂 Happy Birthday!",
    html: birthdayEmailTemplate(name),
  });
};