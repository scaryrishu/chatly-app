import getToken from "../config/token.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import { OAuth2Client } from "google-auth-library"
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)


export const signUp = async (req, res) => {
    try {
        const { userName, email, password } = req.body

        if (userName.length > 14) {
            return res.status(400).json({ message: "username must be less than 15 characters" })
        }

        const checkUserByUserName = await User.findOne({ userName })
        if (checkUserByUserName) {
            return res.status(400).json({ message: "userName already exist" })
        }
        const checkUserByEmail = await User.findOne({ email })
        if (checkUserByEmail) {
            return res.status(400).json({ message: "email already exist" })
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "password must be atleast 6 characters" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({
            userName, email, password: hashedPassword, name: userName
        })

        const token = await getToken(user._id)

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 din likhne ka tarika
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
            secure: process.env.NODE_ENV === "production"
        })

        const userObj = user.toObject()
        userObj.hasPassword = !!userObj.password
        delete userObj.password
        return res.status(201).json(userObj)

    } catch (error) {
        return res.status(500).json({ message: `signup error ${error}` })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "user does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: "incorrect password" })
        }
        const token = await getToken(user._id)

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
            secure: process.env.NODE_ENV === "production"
        })

        const userObj = user.toObject()
        userObj.hasPassword = !!userObj.password
        delete userObj.password
        return res.status(201).json(userObj)

    } catch (error) {
        return res.status(500).json({ message: `login error ${error}` })
    }
}

export const googleAuth = async (req, res) => {
    try {
        const { credential } = req.body
        if (!credential) {
            return res.status(400).json({ message: "google credential is required" })
        }

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        })
        const { email, name, picture, sub: googleId } = ticket.getPayload()

        let user = await User.findOne({ email })

        if (!user) {
            let baseUserName = email.split("@")[0].slice(0, 10)
            let userName = baseUserName
            let suffix = 1
            while (await User.findOne({ userName })) {
                userName = `${baseUserName}${suffix++}`
            }
            user = await User.create({ userName, email, name, image: picture, googleId })
        } else if (!user.googleId) {
            user.googleId = googleId   // existing email/password account ko link kar do
            await user.save()
        }

        const token = await getToken(user._id)
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
            secure: process.env.NODE_ENV === "production"
        })

        const userObj = user.toObject()
        userObj.hasPassword = !!userObj.password
        delete userObj.password
        return res.status(201).json(userObj)
    } catch (error) {
        return res.status(500).json({ message: `google auth error ${error}` })
    }
}


export const logOut = async (req, res) => {
    try {
        res.clearCookie("token")
        return res.status(200).json({ message: "log Out successfully" })
    } catch (error) {
        return res.status(500).json({ message: `logOut error ${error}` })
    }
}