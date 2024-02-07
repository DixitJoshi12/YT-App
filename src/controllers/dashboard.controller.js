import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
try {
        const channelId = req.user?._id;
        if(!channelId){
            throw new ApiError(400,"channel not found");
        }
        // getting total videos of the channel
        const totalVideos = await Video.countDocuments({owner : channelId});
        // getting the total subscribers of the channel
        const totalSubscribers = await Subscription.countDocuments({channel : channelId});
        // getting the total video views for the channel
        const totalVideoViews = await Video.aggregate([
            {
                $match : {
                    owner : new mongoose.Types.ObjectId(channelId)
                },
            },
            {
                $group : {
                    _id : null,
                    totalViews : {
                        $sum : "$views"
                    }
                }
            }
    
        ])
        // getting the total likes of the channel
        const totalLikes = await Video.aggregate([
            {
                $match : {
                    owner : new mongoose.Types.ObjectId(channelId)
                },
            },
            // get all the likes for the user videos
            {
                    $lookup: {
                        from: "likes",
                        localField : "_id",
                        foreignField : "video",
                        as: "likedVideos"
                }
            },
            // get totallikescount for the user videos
            {
                $group: {
                    _id: null,
                    totalLikesCount: {
                        $sum: { $size: "$likedVideos" } // Sum the size of the likedVideos array
                    }
                }
            }
        ])
        res.status(200).json(
            new ApiResponse(200,
                [
                    {
                        "totalVideos" : totalVideos
                    },
                    {
                        "totalSubscribers" : totalSubscribers
                    },
                    totalVideoViews,
                    totalLikes
                ],"success in getting the channel stats")
        )
} catch (error) {
    throw new ApiError(500,error?.message || "Something went wrong while getting channel status")
}
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    try {
        const channelId = req.user?.id;

        if(!channelId){
            throw new ApiError(400,"channel not found")
        }
        const allChannelVideos = await Video.find({owner : channelId});
        if(!allChannelVideos){
            throw new ApiError(500,"Something went wrong while getting the channle videos")
        }
        res.status(200).json(
            new ApiResponse(200,
                [   
                    {
                        "totalVideos" : allChannelVideos.length
                    },
                    allChannelVideos,
                ],
                "success in getting the all channel videos")
        )
    } catch (error) {
        throw new ApiError(500,error?.message || "Error while getting channel videos")
    }
})

export {
    getChannelStats, 
    getChannelVideos
    }