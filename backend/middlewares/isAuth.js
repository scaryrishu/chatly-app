import jwt from "jsonwebtoken"
import User from "../models/user.model.js"

const isAuth = async (req, res, next) => {
    try {
        let token = req.cookies.token
        if (!token) {
            return res.status(400).json({ message: "token is not found" })
        }
        let verifyToken = jwt.verify(token, process.env.JWT_SECRET)

        // A valid JWT signature only proves the token was issued by us at
        // some point — it says nothing about whether that account still
        // exists. Without this check, a deleted user stays "logged in"
        // (fully authenticated) for as long as their token hasn't expired.
        const user = await User.findById(verifyToken.userId)
        if (!user) {
            res.clearCookie("token")
            return res.status(401).json({ message: "account no longer exists" })
        }

        req.userId = verifyToken.userId
        next()
    } catch (error) {
        return res.status(500).json({ message: `isauth error ${error}` })
    }
}

export default isAuth