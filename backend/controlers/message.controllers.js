import Message from "../models/message.model.js"
import { getReceiverSocketId, io } from "../socket.js"
import cloudinary from "../config/cloudinary.js"

export const sendMessage = async (req, res) => {
    try {
        const senderId = req.userId
        const { receiverId } = req.params
        const { message } = req.body

        if ((!message || !message.trim()) && !req.file) {
            return res.status(400).json({ message: "message or image is required" })
        }

                let imageUrl = ""
        if (req.file) {
            const uploadFromBuffer = () =>
                new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: "chatly_messages" },
                        (error, result) => {
                            if (error) reject(error)
                            else resolve(result)
                        }
                    )
                    stream.end(req.file.buffer)
                })

            const result = await uploadFromBuffer()
            imageUrl = result.secure_url
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            message: message || "",
            image: imageUrl
        })

        // If the receiver is online, push the message to them instantly
        const receiverSocketId = getReceiverSocketId(receiverId)
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage)
        }

        return res.status(201).json(newMessage)
    } catch (error) {
        return res.status(500).json({ message: `sendMessage error ${error}` })
    }
}

export const getMessages = async (req, res) => {
    try {
        const myId = req.userId
        const { receiverId } = req.params

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId },
                { senderId: receiverId, receiverId: myId }
            ]
        }).sort({ createdAt: 1 })

        // Opening this chat = I've now seen everything they sent me.
        // Using { $ne: true } instead of { false } so this also catches
        // older messages sent before the `seen` field existed on them —
        // those documents have no `seen` key at all, and a plain
        // `{ seen: false }` filter would never match a missing field.
        const updateResult = await Message.updateMany(
            { senderId: receiverId, receiverId: myId, seen: { $ne: true } },
            { $set: { seen: true } }
        )

        console.log("seen-update result:", updateResult)
        // ^ once confirmed working (modifiedCount > 0 when expected),
        // feel free to delete this log line — it's just for debugging.

        return res.status(200).json(messages)
    } catch (error) {
        return res.status(500).json({ message: `getMessages error ${error}` })
    }
}

export const getLastMessages = async (req, res) => {
    try {
        const myId = req.userId

        const messages = await Message.find({
            $or: [{ senderId: myId }, { receiverId: myId }]
        }).sort({ createdAt: -1 })

        const conversations = {}

        for (const msg of messages) {
            const otherId =
                msg.senderId.toString() === myId.toString()
                    ? msg.receiverId.toString()
                    : msg.senderId.toString()

            if (!conversations[otherId]) {
                conversations[otherId] = {
                    userId: otherId,
                    lastMessage: msg.message,
                    lastMessageAt: msg.createdAt,
                    unreadCount: 0
                }
            }

            if (msg.receiverId.toString() === myId.toString() && !msg.seen) {
                conversations[otherId].unreadCount += 1
            }
        }

        return res.status(200).json(Object.values(conversations))
    } catch (error) {
        return res.status(500).json({ message: `getLastMessages error ${error}` })
    }
}