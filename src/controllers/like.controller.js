import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video
    try {
        if (!videoId) {
            throw new ApiError(400, "Video Id is invalid");
        }
        const likedBy = req.user?._id;
        if (!likedBy) {
            throw new ApiError(400, "user not found");
        }
        const like = await Like.findOne({ video: videoId, likedBy: likedBy });
        if (like) {
            // delete that like
            const deletedLike = await Like.deleteOne({ video: videoId, likedBy })
            if (deletedLike.deletedCount === 0) {
                throw new ApiError(500, "Can't unlike the video")
            }
            return res.status(200)
                .json(
                    new ApiResponse(200, like, "unliked the video")
                )
        } else {
            // add a new like
            const newLike = await Like.create({
                video: videoId,
                likedBy: likedBy
            });
            if (!newLike) {
                throw new ApiError(500, "Error while liking the video")
            }
            return res.status(201)
                .json(
                    new ApiResponse(201, newLike, "vido liked successfully")
                )
        }
    } catch (error) {
        if (error instanceof ApiError) {
            throw error
        } else {
            throw new ApiError(500, error.message || "can't toggle the like")
        }
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    try {
        if (!commentId) {
            throw new ApiError(400, "comment Id not found!");
        }
        const likedBy = req.user?._id;
        if (!likedBy) {
            throw new ApiError(400, "user not found!");
        }
        const commentLike = await Like.findOne({ comment: commentId, likedBy });
        if (commentLike) {
            const deletedCommentLike = await Like.deleteOne({ comment: commentId, likedBy });
            if (deletedCommentLike.deletedCount === 0) {
                throw new ApiError(500, "Something went wrong while unliking the comment like")
            }
            res.status(200)
                .json(
                    new ApiResponse(200, commentLike, "unlike of a comment is successful")
                )
        } else {
            const newCommentLike = await Like.create({ comment: commentId, likedBy })
            if (!newCommentLike) {
                throw new ApiResponse(500, "Error while liking a comment")
            }
            res.status(201)
                .json(
                    new ApiResponse(201, newCommentLike, "like of a comment is successful")
                )
        }
    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong while toggle comment like")
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    try {
        if (!tweetId) {
            throw new ApiError(400, "tweet Id not found!");
        }
        const likedBy = req.user?._id;
        if (!likedBy) {
            throw new ApiError(400, "user not found!");
        }
        const tweetLike = await Like.findOne({ tweet: tweetId, likedBy });
        if (tweetLike) {
            const deletedtweetLike = await Like.deleteOne({ tweet: tweetId, likedBy });
            if (deletedtweetLike.deletedCount === 0) {
                throw new ApiError(500, "Something went wrong while unliking the tweet like")
            }
            res.status(200)
                .json(
                    new ApiResponse(200, tweetLike, "unlike of a tweet is successful")
                )
        } else {
            const newTweetLike = await Like.create({ tweet: tweetId, likedBy })
            if (!newTweetLike) {
                throw new ApiResponse(500, "Error while liking a tweet")
            }
            res.status(201)
                .json(
                    new ApiResponse(201, newTweetLike, "like of a tweet is successful")
                )
        }
    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong while toggle the tweet like")
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    // get all the liked videos of the user
    // can use pagination for now just writing simple controller
    try {
        const likedBy = req.user?._id;
        if (!likedBy) {
            throw new ApiError(400, "user not found!");
        }
        const likedVideos = await Like.find({ likedBy  });
        if (!likedVideos) {
            throw new ApiError(500, "something went wrong while getting all the liked videos")
        }
        res.status(200).json(
            new ApiResponse(200, likedVideos, "success in getting all liked videos")
        )
    } catch (error) {
        throw new ApiError(500, error.message || "Error in getting the liked videos")
    }
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}