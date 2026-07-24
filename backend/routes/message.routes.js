import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { sendMessage, getMessages, getLastMessages } from "../controlers/message.controllers.js"

const messageRouter = express.Router()

messageRouter.post("/send/:receiverId", isAuth, sendMessage)
messageRouter.get("/conversations/last", isAuth, getLastMessages)
messageRouter.get("/:receiverId", isAuth, getMessages)

export default messageRouter