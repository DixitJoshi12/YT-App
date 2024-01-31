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
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        // remove the locally saved temp file as the upload operation got failed
        fs.unlinkSync(localFilePath);
        return null;
    }
}

async function deleteOnCloudinary(fileUrl,resourceType) {
 // no delete by url in cloudinary only by public_id which we haven't stored so leaving this now
    cloudinary.uploader
    .destroy('http://res.cloudinary.com/dg6i6zqcw/video/upload/v1706724516/x4qgnj1q6d2fseuaeqo5.mp4', {resource_type: 'video'})
    .then(result => console.log(result));
  }
  
export {uploadOnCloudinary,deleteOnCloudinary};