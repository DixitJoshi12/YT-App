import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
try {
        const {name, description} = req.body
        if([name,description].some(item => item.trim() === "")){
            throw new ApiError(400,"Name and description both are required!")
        }
        const owner = req.user?._id;
        if(!owner){
            throw new ApiError(400,"user not found!")
        }
        const playlist = await Playlist.create({
            name,
            description,
            owner
        });
        if(!playlist){
            throw new ApiError(500,"Error in creating the playlist!")
        }
        res.status(201).json(
            new ApiResponse(201,playlist,"playlist created")
        )
} catch (error) {
    throw new ApiError(500,error.messgae || "Something went wrong while creating the playlist")
}

    //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    try {
        if(!userId){
            throw new ApiError(400,"user not found!")
        }
        const palylists = await Playlist.find({owner : userId});
        if(palylists.length === 0){
            throw new ApiError(500,"Error in fetching user playlist")
        }
        res.status(200).json(
            new ApiResponse(200,palylists,"User playlist is successfully fetched")
        )
    } catch (error) {
        throw new ApiError(500,error.messgae || "Error while getting the user playlist")
    }
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    try {
        if(!playlistId){
            throw new ApiError(400,"playlist not found!")
        }
        const playlist = await Playlist.findById(playlistId);
        if(!playlist){
            throw new ApiError(500,"Error while fetching playlist")
        }
        res.status(200).json(
            new ApiResponse(200,playlist,"playlist fetched successfully")
        )
    } catch (error) {
        throw new ApiError(500,error.messgae || "Error while getting the playlist")
    }
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    try {
        if([playlistId,videoId].some(item=> item.trim() === "")){
            throw new ApiError(400,"playlistId and videoId both are required!")
        }
        const addVideoInPlaylist = await Playlist.findByIdAndUpdate(
            playlistId,
            {
                $push : {
                    videos : videoId
                }
            },
            {
                new : true
            }
        );
        if(!addVideoInPlaylist){
            throw new ApiError(500,"Error in adding video to the playlist")
        }
        res.status(200).json(
            new ApiResponse(200,addVideoInPlaylist,"video added to the playlist")
        )
    } catch (error) {
        throw new ApiError(500,error.messgae || "Error while adding video to a playlist")
    }
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    try {
        if([playlistId,videoId].some(item=> item.trim() === "")){
            throw new ApiError(400,"playlistId and videoId both are required!")
        }
        const updatePlaylist = await Playlist.findByIdAndUpdate(
            playlistId,
            {
                $pull : {
                    videos : videoId
                }
            },
            {
                new : true
            }
        );
        if(!updatePlaylist){
            throw new ApiError(500,"Error in removing video to the playlist")
        }
        res.status(200).json(
            new ApiResponse(200,updatePlaylist,"video removed from the playlist")
        )
    } catch (error) {
        throw new ApiError(500,error.messgae || "Error while removing video from the playlist")
    }
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    try {
        if(!playlistId){
            throw new ApiError(400,"Playlist not found")
        }
        const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);
        if(!deletedPlaylist){
            throw new ApiError(500,"Error in deleting the playlist")
        }
        res.status(200).json(
            new ApiResponse(200,deletedPlaylist,"palylist deleted successfully")
        )
    } catch (error) {
        throw new ApiError(500,error.messgae || "Error in deleting the playlist")
    }
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    try {
        if(!playlistId){
            throw new ApiError(400,"playlist not found!")
        }
        if([name,description].some(item=> item.trim() === "")){
            throw new ApiError(400,"name and description both are required!")
        }
        const updatedPlaylist = await Playlist.findByIdAndUpdate(
            playlistId,
            {
                $set : {
                    name,
                    description
                }
            },
            {
                new : true
            }
        );
        if(!updatedPlaylist){
            throw new ApiError(500,"Error while updating the playlist")
        }
        res.status(200).json(
            new ApiResponse(200,updatedPlaylist,"playlist updated")
        )
    } catch (error) {
        throw new ApiError(500,error.messgae || "Error while updating the playlist")
    }
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}