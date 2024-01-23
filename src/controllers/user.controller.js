import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userID) => {
    try {
        const user = await User.findById(userID);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
}

const registerUser = asyncHandler(async (req, res) => {
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
        $or: [{ email }, { userName }]
    });
    if (existedUser) {
        throw new ApiError(409, "User existed!");
    }

    // check for images existed or not
    console.log(req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required!");
    }
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    // upload images into cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar File is required!");
    }
    // enter the User into DB
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase()
    });
    // check if user is successfully created and remove password and refreshToken
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering User!");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Created Successfully")
    )

});

const loginUser = asyncHandler(async (req, res) => {
    // get the username or email and password
    const { email, userName, password } = req.body;
    // check for empty values
    if (!(!userName || !email)) {
        throw new ApiError(400, "userName or email is required!");
    }
    // check in db if information is same or not 
    const user = await User.findOne({
        $or: [{ email }, { userName }]
    });
    //email or username and password wrong message
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "invalid password!");
    }

    // if credentials matches then provide the access token and refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    // send them in cookies
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
        .cookie("accessToken ", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                }, "User Logged In Successfully"),
        )
})

const logOutUser = asyncHandler(async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id,
            {
                $set: {
                    refreshToken: undefined
                }
            },
            {
                new: true
            });
        const options = {
            httpOnly: true,
            secure: true
        }
        res.status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, {}, "User logged out successfully"))
    } catch (error) {
        throw new ApiError(401, error.message);
    }
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshAccessToken || req.body.refreshAccessToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new ApiError(401, "invalid refresh token");
        }
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "refresh token is expired or used");
        }
        const options = {
            httpOnly: true,
            secure: true
        }
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id);
        return res.status(200)
            .cookie('accessToken', accessToken, options)
            .cookie('refreshToken', newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken: accessToken, refreshToken: newRefreshToken },
                    "Access token is refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401,error?.message || "invalid refresh token")
    }
})

export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken
}

