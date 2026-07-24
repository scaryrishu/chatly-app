import Message from "../models/message.model.js"
import { getReceiverSocketId, io } from "../socket.js"  

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.userId
    const { receiverId } = req.params
    const { message } = req.body

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message
    })

    // 🔥 Real-time: send to receiver if online
    const receiverSocketId = getReceiverSocketId(receiverId)
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage)
    }

    return res.status(201).json(newMessage)

  } catch (error) {
    return res.status(500).json({ message: `sendMessage error ${error}` })
  }
}

// Get all messages between two users
export const getMessages = async (req, res) => {
  try {
    const senderId = req.userId
    const { receiverId } = req.params

    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).sort({ createdAt: 1 }) // oldest first

    return res.status(200).json(messages)

  } catch (error) {
    return res.status(500).json({ message: `getMessages error ${error}` })
  }
}


export const getLastMessages = async (req, res) => {
  try {
    const userId = req.userId

    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ createdAt: -1 })

    // Get the latest message per conversation
    const lastMessageMap = {}
    messages.forEach((msg) => {
      const otherUser = msg.senderId.toString() === userId.toString()
        ? msg.receiverId.toString()
        : msg.senderId.toString()

      if (!lastMessageMap[otherUser]) {
        lastMessageMap[otherUser] = msg
      }
    })

    return res.status(200).json(lastMessageMap)
  } catch (error) {
    return res.status(500).json({ message: `getLastMessages error ${error}` })
  }
}