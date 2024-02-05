import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const user = req.user;
    if (!content) {
        throw new ApiError(400, "Content is required");
    }
    if (!user) {
        throw new ApiError(400, "Invalid user!");
    }
    const tweet = await Tweet.create({
        content: content,
        owner: user._id
    })
    if (!tweet) {
        throw new ApiError(500, "Something went wrong while creating a tweet")
    }
    return res.status(201)
        .json(
            new ApiResponse(201, tweet, "tweet created successfully")
        )
})

const getUserTweets = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            throw new ApiError(400, "UserdId not found!");
        }
        const tweets = await Tweet.find({ owner: userId });

        return res.status(200)
            .json(
                new ApiResponse(200, tweets, "get all the tweets for the user")
            )

    } catch (error) {
        throw new ApiError(400, error.message || "tweets not found for this user");

    }
})

const updateTweet = asyncHandler(async (req, res) => {
    // user can modified their own tweets
    const { tweetId } = req.params;
    const { content } = req.body;
    const userId = new mongoose.Types.ObjectId(req.user._id).toString();

    if (!tweetId) {
        throw new ApiError(400, "tweetId not found")
    }
    if (!content) {
        throw new ApiError(400, "Content is required");
    }
    const updatedTweet = await Tweet.findOneAndUpdate(
        {
            _id: tweetId,
            owner: userId
        },
        {
            $set : {
                content
            }
        },
        {
            new: true
        }
    );
    if (!updatedTweet) {
        throw new ApiError(400, "Unauthorized.");
    }
    res.status(200)
        .json(
            new ApiResponse(200, updatedTweet, "tweet modified")
        )

})

const deleteTweet = asyncHandler(async (req, res) => {
    // check againg
try {
        const { tweetId } = req.params;
        const userId = new mongoose.Types.ObjectId(req.user._id).toString();
    
        if (!tweetId) {
            throw new ApiError(400, "tweetId not found")
        }
        const delTweet = await Tweet.deleteOne(
            {
                _id: tweetId,
                owner: userId
            },
        );
        if (delTweet.deletedCount === 0) {
            throw new ApiError(400, "Unauthorized.");
        }
        res.status(200)
            .json(
                new ApiResponse(200, delTweet, "tweet deleted")
            )
} catch (error) {
    throw new ApiError(400, error?.message ||"Unauthorized.");
}

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}