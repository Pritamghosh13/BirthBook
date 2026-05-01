import { app } from "./app.js"
import { connectDB } from "./db/db.js"
import dotenv from "dotenv"
import "./mailer/birthday_mail_send.js"



dotenv.config({
    path: './.env'
})


const port = process.env.PORT || 8000


connectDB()
.then(() => {
    try {
        app.listen(port, () => {
            console.log(`Server is running at port ${port}`);
        })

        app.on("Error", (error) => {   //for server errors.
            console.log("ERROR: ", error);
        })


    } catch (error) {  //for DB related error.
        console.log("DB connection failed !!", error);
        
    }
})