import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { changePassword, deleteUser, editProfile, getAllUsers, getCurrentUser } from "../controlers/user.controllers.js"
import optionalAuth from "../middlewares/optionalAuth.js"
import upload from "../middlewares/multer.js"

const userRouter=express.Router()

userRouter.get("/current", optionalAuth, getCurrentUser)
userRouter.get("/all", isAuth, getAllUsers)
userRouter.put("/profile", isAuth, upload.single("image"), editProfile)
userRouter.delete("/delete", isAuth, deleteUser)
userRouter.post("/change-password", isAuth, changePassword)

export default userRouter 