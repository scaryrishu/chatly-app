import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { sendMessage, getMessages, getLastMessages } from "../controlers/message.controllers.js"
import upload from "../middlewares/multer.js"

const messageRouter = express.Router()

messageRouter.post("/send/:receiverId", isAuth, upload.single("image"), sendMessage)
messageRouter.get("/conversations/last", isAuth, getLastMessages)
messageRouter.get("/:receiverId", isAuth, getMessages)

export default messageRouter