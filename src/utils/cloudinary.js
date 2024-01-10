import { v2 as cloudinary} from "cloudinary";
import fs from "fs";
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});


async function uploadOnCloudinary(localFilePath){
    try {
        if(!localFilePath) return null;
        //upload file to cloudinary
       const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type  : "auto"
        })
        //file loaded successfully
        console.log("file loaded successfully ", response.url);
        return response;
    } catch (error) {
        // remove the locally saved temp file as the upload operation got failed
        fs.unlinkSync(localFilePath);
        return null;
    }
}

export {uploadOnCloudinary};