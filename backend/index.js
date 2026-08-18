import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cookieParser from "cookie-parser"
import connectDb from "./config/db.js"
import authRouter from "./routes/auth.routes.js"
import cors from "cors"
import userRouter from "./routes/user.routes.js"
import messageRouter from "./routes/message.routes.js"
import { app, server } from "./socket.js"   // ← changed import

const port = process.env.PORT || 5000

app.use(cors({ // cors : Iska kaam frontend ko backend API access karne ki permission dena hai
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials:true
}))
app.use(express.json())  // for api calling
app.use(cookieParser())  // for cookies
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/message", messageRouter)

server.listen(port, () => {     // ← server instead of app
    connectDb()
    console.log("server started")
})