import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

try {
        if(!videoId){
            throw new ApiError(400,"Video not found!")
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
    
        // calculating the skip value for pagination 
        const skip = (pageNum - 1) * limitNum;
    
        // finding the comment for the given videoId using aggreagation
        const comments = await Comment.aggregate([
            {
                $match :{
                    video : new mongoose.Types.ObjectId(videoId)
                }
            },
            {
                $sort : {
                    createdAt : -1// sorting by createdAt by desc
                }
            },
            {
                $skip : skip
            },
            {
                $limit : limitNum
            }
        ]);
        if(!comments){
            throw new ApiError(500,"Error while getting the comments for the video")
        }
        const totalCommentCount = await Comment.countDocuments({video : new mongoose.Types.ObjectId(videoId)})
        if(!totalCommentCount){
            throw new ApiError(500,"Someting went wrong while getting totalComment count")
        }
        // creating paginating object to send in the response
        const pagination = {
            page : pageNum,
            totalPages : Math.ceil(totalCommentCount / limitNum),
            totalRecrods : totalCommentCount
        }
        res.status(200).json(
            new ApiResponse(200,[comments,pagination ],"successfully got the comments for the video")
        )
} catch (error) {
    if(error instanceof ApiError){
        throw error
    }else{
        throw new ApiError(500, error.message || "Error while getting the comments")
    }
}
})

const addComment = asyncHandler(async (req, res) => {
    try {
        const owner = req.user?._id;
        if (!owner) {
            throw new ApiError(400, "user not found!");
        }
        const { videoId } = req.params
        const { content } = req.body;
        if ([content, videoId].some(item => item.trim() === "")) {
            throw new ApiError(400, "Both conent and video id is required!")
        }
        const newComment = await Comment.create({
            owner,
            content,
            video: videoId
        });
        if (!newComment) {
            throw new ApiError(500, "Error while creating a comment");
        }
        res.status(201).json(
            new ApiResponse(201, newComment, "comment is created")
        )
    } catch (error) {
        throw new ApiError(500, error.message || "Error while commenting a video")
    }
})

const updateComment = asyncHandler(async (req, res) => {
    try {
        const { commentId } = req.params;
        if (!commentId) {
            throw new ApiError(400, "comment Id is required!");
        }
        const { content } = req.body;
        if (!content) {
            throw new ApiError(400, "content is required!");
        }
        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,
            {
                $set : {
                    content
                }
            },
            {
                new: true
            }
        );
        if(!updateComment){
            throw new ApiError(500,"Error in updating a comment");
        }
        res.status(200).json(
            new ApiResponse(200,updateComment,"Comment updated successfully")
        )
    } catch (error) {
        throw new ApiError(error.message || "Something went wrong while updating the comment")
    }
})

const deleteComment = asyncHandler(async (req, res) => {
 try {
       const {commentId} = req.params;
       if(!commentId){
           throw new ApiError(400,"comment id doesn't exists!");
       }
       const deletedComment = await Comment.findByIdAndDelete(commentId);
       console.log(deletedComment)
       if(!deletedComment){
           throw new ApiError(500,"Error while deleting a comment");
       }
       res.status(200).json(
           new ApiResponse(200,deletedComment,"Comment successfully delete")
       )
 } catch (error) {
    throw new ApiError(500,error.message || "Error while deleting the comment")
 }
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}