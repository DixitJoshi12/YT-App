import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/apiError.js";

import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    try {
        const { title, description } = req.body
        if ([title, description].some(item => item.trim() === "")) {
            throw new ApiError(400, "Title and description are required")
        }
        const user = req.user;
        if (!user) {
            throw new ApiError(400, "user not found!")
        }
        const videoLocalPath = req.files?.videoFile[0].path;
        const thumbnailLocalPath = req.files?.thumbnail[0].path;
        if (!videoLocalPath) {
            throw new ApiError(400, "video not found")
        }
        if (!thumbnailLocalPath) {
            throw new ApiError(400, "thumbnail not found")
        }

        const video = await uploadOnCloudinary(videoLocalPath);
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

        if (!video) {
            throw new ApiError(500, "Error in uploading video to cloudinary")
        }
        if (!thumbnail) {
            throw new ApiError(500, "Error in uploading thumbnail to cloudinary")
        }
        const newVideo = await Video.create({
            videoFile: video.url,
            thumbnail: thumbnail.url,
            title,
            description,
            duration: video?.duration,
            isPublished: true,
            owner: user?._id.toString()
        });
        res.status(201)
            .json(
                new ApiResponse(201, newVideo, "video successfully created")
            )
    } catch (error) {
        throw new ApiError(500, error?.message || "Someting went wrong while creating the video")
    }
})

const getVideoById = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params
        if (!mongoose.Types.ObjectId.isValid(videoId)) {
            return res.status(400).json({ error: 'Invalid videoId' });
        }
        const video = await Video.findById(videoId);
        if (!video) {
            throw new ApiError(500, "can't get the video")
        }
        res.status(200).json(
            new ApiResponse(200, video, "success")
        )
    } catch (error) {
        if (error instanceof ApiError) {
            throw error
        } else {
            throw new ApiError(500, "Error while fetching the video from server");
        }
    }
    //TODO: get video by id
    // get user information with it
    // user info like avatar, username like subscribe button subs count -- from video view comment
    // console.log(req.user)

    // const userSubscriberCount = await User.aggregate([
    //     {
    //         $match : {
    //             _id : new mongoose.Types.ObjectId(req.user?._id)
    //         },
    //     },
    //     {
    //         $lookup : {
    //             from : 'subscriptions',
    //             localField : '_id',
    //             foreignField : 'channel',
    //             as : 'subscribers'
    //         }
    //     },
    //     {
    //         $addFields : {
    //             subscribersCount : {
    //                 $size : "$subscribers"
    //             }
    //         }
    //     },
    //     {
    //         $project : {
    //             subscribersCount : 1
    //         }
    //     }
    // ]);
    // console.log(userSubscriberCount[0].subscribersCount)
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    // next task

})

const deleteVideo = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params
        if (!mongoose.Types.ObjectId.isValid(videoId)) {
            return res.status(400).json({ error: 'Invalid videoId' });
        }
        /* get the video and thumbnail url's from db and delete in cloudinary
        // commenting the below code because coludinary doesn't delete by url instead by public id
        //const {videoFile , thumbnail} = await Video.findById(videoId);
        */
        const deletedVideo = await Video.findByIdAndDelete(videoId);
        if (!deletedVideo) {
            throw new ApiError(200, "there is an error while deleting the video")
        }
        res.status(200).json(new ApiResponse(200, deletedVideo, "video deleted successfully"))
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        } else {
            throw new ApiError(500, error.message || "Error while deleting the video");
        }
    }
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    // can do the same by using $bit operator with xor but here I have used two db calls
    try {
        const { videoId } = req.params
        if (!mongoose.Types.ObjectId.isValid(videoId)) {
            return res.status(400).json({ error: 'Invalid videoId' });
        }
        const isPublished = await Video.findById(videoId).select("isPublished");
        const video = await Video.findByIdAndUpdate(
            videoId,
            {
                $set: {
                    isPublished: !isPublished.isPublished
                }
            },
            {
                new: true
            }
        ).select("_id isPublished")
        if (!video) {
            throw new ApiError(500, "Something went wrong while changing the publish status")
        }
        res.status(200).json(new ApiResponse(200, video, "publish status is changed"))
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        } else {
            throw new ApiError(500, "Error in updating the publish status of the video");
        }
    }
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}