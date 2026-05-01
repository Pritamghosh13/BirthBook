import express from "express"
import { router } from "./route/user.route.js"
import cookieParser from "cookie-parser"
import cors from "cors";


const app = express()


app.use(cors({
  origin: "http://127.0.0.1:5502",
  credentials: true
}));

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


app.use("/api/v1/users", router)




export {app}