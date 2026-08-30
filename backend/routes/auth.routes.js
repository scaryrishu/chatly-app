import express from "express"
import { login, logOut, signUp, googleAuth } from "../controlers/auth.controlers.js"

const authRouter=express.Router()

authRouter.post("/signup",signUp)
authRouter.post("/login",login)
authRouter.post("/google",googleAuth)
authRouter.post("/logout",logOut)

export default authRouter