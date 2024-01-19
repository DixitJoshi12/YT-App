import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";



const jwtValidator = asyncHandler(async(req,_,next)=>{
try {
        const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
        
        if(!accessToken){
            throw new ApiError(401,"Unauthorized!");
        }
        // now check if the token is valid or not
       const validAccessToken =  jwt.compare(accessToken,process.env.ACCESS_TOKEN_SECRET);
       const user = await User.findById(validAccessToken?._id).select("-password -refreshToken");
       if(!user){
        throw new ApiError(401,"Invalid Access Token");
       }
       req.user = user;
        next();
} catch (error) {
    throw new ApiError(401,err?.message || "Invalid access token");
}

});

export const validateJWT = {jwtValidator}