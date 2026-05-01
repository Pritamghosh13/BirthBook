import nodeCron from "node-cron";
import {User} from "../models/user.model.js"
import { sendBirthdayEmail } from "./mailService.js";



nodeCron.schedule("6 13 * * *", async () => {
    try {
        console.log("Running birthday check...");

        const today = new Date();
        const month = today.getMonth() + 1;
        const day = today.getDate();

        const users = await User.find();
        // const data = users.data;

        users.forEach(async (user) => {
            // const dob = new Date(user.dob);

            await sendBirthdayEmail(user.email, user.fullname)

            // if(dob.getDate() === day && (dob.getMonth()+1) === month){
            // }
        })
        
    } catch (err) {
        console.log(err, "Error in node-corn");
        
    }
})