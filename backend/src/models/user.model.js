import mongoose from "mongoose";
import jwt from 'jsonwebtoken'

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unquie:true,
    },
    password:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    fullName:{
        type:String,
        required:true,
    },
    profileImage:{
        type:String,
        default:"",
    },
    refreshToken: {
        type: String,
        default: ""
    }
},{timeStamps:true});





export const User = mongoose.model("User", userSchema);