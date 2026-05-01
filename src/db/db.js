import { DB_NAME } from "../constans.js";
import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config({
    path: './.env'
})

const connectDB = async () => {
    try {
        const connectionIntance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`\nMongoDB connected !! DB Host: ${connectionIntance.connection.host}`);
        
    } catch (err) {
        console.log("Error: DB connection failed", err);
        process.exit(1)
    }
}

export {connectDB}