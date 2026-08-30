import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    name:{
        type:String
    },
    userName:{
        type:String,
        required:true,
        unique:true,
        maxlength:[14,"username must be less than 15 characters"]
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:function(){ return !this.googleId }
    },
    googleId:{
        type:String,
        default:null
    },
    image:{
        type:String,
        default:""
    }
},{timestamps:true})

const User=mongoose.model("User",userSchema)

export default User