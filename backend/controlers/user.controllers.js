
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import cloudinary from "../config/cloudinary.js"
import Message from "../models/message.model.js"

export const getCurrentUser = async (req, res) => {
    try {
        let userID = req.userId
        if (!userID) {
            return res.status(200).json(null)
        }

        let user = await User.findById(userID).select("-password")
        if (!user) {
            return res.status(200).json(null)
        }

        const userObj = user.toObject()
        userObj.hasPassword = !!userObj.password
        delete userObj.password

        return res.status(200).json(userObj)
    } catch (error) {
        return res.status(500).json({ message: `current user error ${error}` })
    }
}

export const changePassword = async (req, res) => {
    try {
        const userId = req.userId
        const { oldPassword, newPassword } = req.body

        if (!newPassword) {
            return res.status(400).json({ message: "new password is required" })
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: "new password must be atleast 6 characters" })
        }

        const user = await User.findById(userId)
        if (!user) {
            return res.status(400).json({ message: "user not found" })
        }

        // Google-only accounts have no password yet — skip the old-password
        // check and let them set one for the first time.
        if (user.password) {
            if (!oldPassword) {
                return res.status(400).json({ message: "old password is required" })
            }
            const isMatch = await bcrypt.compare(oldPassword, user.password)
            if (!isMatch) {
                return res.status(400).json({ message: "old password is incorrect" })
            }
            if (oldPassword === newPassword) {
                return res.status(400).json({ message: "new password must be different from old password" })
            }
        }

        user.password = await bcrypt.hash(newPassword, 10)
        await user.save()

        return res.status(200).json({ message: "password updated successfully" })
    } catch (error) {
        return res.status(500).json({ message: `change password error ${error}` })
    }
}

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({
            _id: { $ne: req.userId }   // exclude current user
        }).select("-password")

        return res.status(200).json(users)
    } catch (error) {
        return res.status(500).json({ message: `error ${error}` })
    }
}

export const deleteUser = async (req, res) => {
    try {
        const userId = req.userId
        const { password } = req.body

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: "user not found" })
        }

        if (!password) {
            return res.status(400).json({ message: "password is required to delete account" })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: "incorrect password" })
        }

        await User.findByIdAndDelete(userId)
        await Message.deleteMany({
            $or: [{ senderId: req.userId }, { receiverId: req.userId }]
        })
        res.clearCookie("token")

        return res.status(200).json({ message: "account deleted successfully" })
    } catch (error) {
        return res.status(500).json({ message: `delete user error ${error}` })
    }
}

export const editProfile = async (req, res) => {
    try {
        const userId = req.userId
        const { name } = req.body

        const updateData = {}
        if (name !== undefined) updateData.name = name

        if (req.file) {
            const uploadFromBuffer = () =>
                new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: "chatly_profiles" },
                        (error, result) => {
                            if (error) reject(error)
                            else resolve(result)
                        }
                    )
                    stream.end(req.file.buffer)
                })

            const result = await uploadFromBuffer()
            updateData.image = result.secure_url
        }

        const user = await User.findByIdAndUpdate(userId, updateData, {
            new: true,
            runValidators: true
        }).select("-password")

        if (!user) {
            return res.status(400).json({ message: "user not found" })
        }

        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({ message: `edit profile error ${error}` })
    }
}