
import mongoose from "mongoose"
import dotenv from "dotenv"
import User from "./models/user.model.js"
import Message from "./models/message.model.js"

dotenv.config()

const run = async () => {
    await mongoose.connect(process.env.MONGODB_URL)
    console.log("db connected")

    const validUserIds = new Set(
        (await User.find({}, "_id")).map((u) => u._id.toString())
    )

    const allMessages = await Message.find({}, "_id senderId receiverId")

    const orphanedIds = allMessages
        .filter(
            (m) =>
                !validUserIds.has(m.senderId.toString()) ||
                !validUserIds.has(m.receiverId.toString())
        )
        .map((m) => m._id)

    console.log(`found ${orphanedIds.length} orphaned messages out of ${allMessages.length} total`)

    if (orphanedIds.length > 0) {
        const result = await Message.deleteMany({ _id: { $in: orphanedIds } })
        console.log(`deleted ${result.deletedCount} orphaned messages`)
    }

    await mongoose.disconnect()
    process.exit(0)
}

run().catch((err) => {
    console.error("cleanup failed:", err)
    process.exit(1)
})