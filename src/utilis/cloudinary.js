import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"
import { ApiError } from './apiError.js';
cloudinary.config({ 
  cloud_name: process.env.MY_CLOUD_NAME, 
  api_key: process.env.MY_CLOUD_KEY, 
  api_secret: process.env.MY_CLOUD_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        fs.unlinkSync(localFilePath) 

        console.log("File is uploaded on cloudniary", response.url);

        return response
        
    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the locally save temporary file
        return null;
    }
}



const deleteFromCloudinary = async(id) => {
    if(!id){
        throw new ApiError(400, "Id is Invalid")
    }

    await cloudinary.uploader.destroy(id);

    return ;
}

export {
    uploadOnCloudinary,
    deleteFromCloudinary

}