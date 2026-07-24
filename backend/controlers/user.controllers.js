import User from "../models/user.model.js"
import bcrypt from "bcryptjs"

export const getCurrentUser=async (req,res)=>{
    try {
        let userID = req.userId
        let user = await User.findById(userID).select("-password")
        if(!user){
            return res.status(400).json({message:"user not found"})
        }

        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({message:`current user error ${error}`})
    }
}

export const changePassword = async (req, res) => {
    try {
        const userId = req.userId
        const { oldPassword, newPassword } = req.body

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "old and new password are required" })
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: "new password must be atleast 6 characters" })
        }

        const user = await User.findById(userId)
        if (!user) {
            return res.status(400).json({ message: "user not found" })
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: "old password is incorrect" })
        }
        if (oldPassword === newPassword) {
            return res.status(400).json({ message: "new password must be different from old password" })
        }

        user.password = await bcrypt.hash(newPassword, 10)
        await user.save()

        return res.status(200).json({ message: "password changed successfully" })
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

        res.clearCookie("token")

        return res.status(200).json({ message: "account deleted successfully" })
    } catch (error) {
        return res.status(500).json({ message: `delete user error ${error}` })
    }
}