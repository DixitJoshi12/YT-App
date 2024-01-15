import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    // res.status(200).json({
    //     message : 'ok'
    // })

    // get data from frontend
    const { fullName, email, userName, password } = req.body;
    console.log("email : ", email);
    // validates for empty values
    if (
        [fullName, email, userName, password].some(item =>
            item.trim() === "")) {
        throw new ApiError(400, "All fields are required!");
    }

    // check for user already existed or not
    const existedUser = await User.findOne({
        $or : [{email}, {userName}]
    });
    if(existedUser){
        throw new ApiError(409,"User existed!");
    }

    // check for images existed or not
    console.log(req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required!");
    }
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    // upload images into cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400,"Avatar File is required!");
    }
    // enter the User into DB
    const user = await User.create({
        fullName,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase()
    });
    // check if user is successfully created and remove password and refreshToken
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering User!");
    }
    
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Created Successfully")
    )

});

export { registerUser }