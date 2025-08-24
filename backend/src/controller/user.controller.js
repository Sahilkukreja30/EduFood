import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";

import {ApiResponse} from '../utils/ApiResponse.js'


export const registerUser = asyncHandler(async (req, res) => {
    // Get details from req body
    // Check if user already exists
    // check user is unique or not

    const {username, password, fullName, userType} = req.body;
    if(!username || !password || !fullName || !userType){
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({
        $or: [
            {username: username},
        ]
    })
    if(existingUser){
        throw new ApiError(400, "User already exists");
    }
    
    const user = await User.create({
        username,
        password,
        fullName,
        userType
    })

    const createdUser = await User.findById(user._id).select("-password")
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    )
})


export const loginUser = asyncHandler(async (req,res)=>{
    const {username, password} = req.body;
    if(!username || !password){
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findOne({username})
    if(!user){
        throw new ApiError(400, "Invalid credentials");
    }
    const isPasswordValid = await user.comparePassword(password);
    if(!isPasswordValid){
        throw new ApiError(400, "Invalid credentials");
    }
    return res.status(200).json(
        new ApiResponse(200, user, "User logged in successfully")
    )
})