import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"
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


const generateAccessAndRefreshToken = async (userId)=>{
    try {
        const user = await User.findById(userId)
        // console.log(user);
        const accessToken = jwt.sign(
                {
                    _id:user._id,
                    email:user.email,
                    username:user.username
                },
                process.env.ACCESS_TOKEN_SECRET,
                {
                    expiresIn:process.env.ACCESS_TOKEN_EXPIRY
                }
            )
        const refreshToken = jwt.sign(
                {
                    _id:user._id,
                },
                process.env.REFRESH_TOKEN_SECRET,
                {
                    expiresIn:process.env.REFRESH_TOKEN_EXPIRY
                }
            )
        
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        
        return {accessToken,refreshToken}
    } catch (error) {
        return ApiError(500,"Something went wrong while generating tokens")
    }
}

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
    
    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,accessToken,refreshToken
            },
            "User is logged in succesfully"
        )
    )
})

export const logOutUser = asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new:true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged out"))
})

