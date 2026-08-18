import jwt from "jsonwebtoken"
const getToken=async (userId)=>{
    try {
        const token= await jwt.sign({userId},process.env.JWT_SECRET,{expiresIn:"7d"}) // token 7 din baad expire ho jaega mtlb fir se login karo
        return token
    } catch (error) {
        console.log("gen token error")
    }
}

export default getToken