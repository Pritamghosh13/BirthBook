import express from "express"
import { router } from "./route/user.route.js"
import cookieParser from "cookie-parser"
import cors from "cors";


const app = express()


app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, postman, same-origin)
    if (!origin) return callback(null, true);
    if (
      origin.startsWith("http://localhost:") || 
      origin.startsWith("http://127.0.0.1:") ||
      origin.startsWith("https://localhost:") ||
      origin.startsWith("https://127.0.0.1:") ||
      origin === "http://localhost" ||
      origin === "http://127.0.0.1"
    ) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


app.use("/api/v1/users", router)


// Global Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || err.statuscode || 500;
  const message = err.message || "Internal Server Error";

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: err.errors || []
  });
});


export {app}