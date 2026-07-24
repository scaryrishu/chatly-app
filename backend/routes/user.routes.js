import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { changePassword, deleteUser, getAllUsers, getCurrentUser } from "../controlers/user.controllers.js"

const userRouter=express.Router()

userRouter.get("/current", isAuth, getCurrentUser)
userRouter.get("/all", isAuth, getAllUsers)
userRouter.delete("/delete", isAuth, deleteUser)
userRouter.post("/change-password", isAuth, changePassword)

export default userRouter 