import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// tested all controllers
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    const userId = req.user?._id;
    try {
        if (!mongoose.Types.ObjectId.isValid(channelId)) {
            return res.status(400).json({ error: 'Invalid channelId' });
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid User' });
        }
        // check if user is subscribed to that channel
        const existingSubscription = await Subscription.findOne({ subscriber: userId, channel: channelId });
        if (existingSubscription) {
            // remove the envtry from db
            await Subscription.deleteOne(existingSubscription._id);
            return res.status(200).json(
                new ApiResponse(200, existingSubscription, "Channel unsubscribed")
            )
        } else {
            // create a new subscription record
            const subscription = await Subscription.create({ subscriber: userId, channel: channelId })
            if (!subscription) {
                throw new ApiError(500, "Something went wrong while subscribing the channel")
            }
            return res.status(201).json(
                new ApiResponse(201, subscription, "Channel subscribed")
            )
        }
    } catch (error) {
        if (error instanceof ApiError) {
            throw error
        } else {
            throw new ApiError(500, "Something went wrong while toggling the subscription")
        }
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
try {
        const { subscriberId } = req.params
        if (!subscriberId) {
            throw new ApiError(400, "Channel not found plese enter the valid subscriberId")
        }
        const subscribers = await Subscription.find({ channel: subscriberId });
        if (!subscribers) {
            throw new ApiError(500, "Error in getting the subscribers");
        }
        const subscribersUserName = [];
        for(const item of subscribers){
            const user = await User.findById(item.subscriber);
            if(!user){
                throw new ApiError(500,"Error in finding the subscribers")
            }
            subscribersUserName.push(user.userName)
        }
        res.status(200).json(
            new ApiResponse(200,subscribersUserName,"success in getting the subscribers")
        )
} catch (error) {
    if(error instanceof ApiError){
        throw error
    }else{
        throw new ApiError(500,"Error in finding the subscribers")
    }
}
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  try {
      const { channelId } = req.params
      if(!channelId){
          throw new ApiError(400,"channelId is invalid")
      }
      const channels = await Subscription.find({subscriber : channelId})
      if (!channels) {
          throw new ApiError(500, "Error in getting the channel");
      }
      const channelName = [];
      for(const item of channels){
          const user = await User.findById(item.channel);
          if(!user){
              throw new ApiError(500,"Error in finding the channels")
          }
          channelName.push(user.userName)
      }
      res.status(200).json(
          new ApiResponse(200,channelName,"success in getting the channel")
      )
  } catch (error) {
    if(error instanceof ApiError){
        throw error
    }else{
        throw new ApiError(500,"Error in finding the channel")
    }
  }
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}