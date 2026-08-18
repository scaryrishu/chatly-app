import jwt from "jsonwebtoken"

const optionalAuth = async (req, res, next) => {
    try {
        let token = req.cookies.token
        if (!token) {
            req.userId = null
            return next()
        }
        let verifyToken = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(verifyToken.userId)
        if (!user) {
            res.clearCookie("token")
            req.userId = null
            return next()
        }
        req.userId = verifyToken.userId
    } catch (error) {
        req.userId = null
    }
    next()
}

export default optionalAuth