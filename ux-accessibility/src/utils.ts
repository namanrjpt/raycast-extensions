import { v2 as cloudinary } from "cloudinary";
import { UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: "drl4pttyj",
  api_key: "479518418238263",
  api_secret: "ExkiGW7JQnfqb_a_F5OKFCofYPY",
});

export const uploadToCloudinary = async (imageBuffer: Buffer, folder: string = "default"): Promise<string> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
        },
        (error, result) => {
          if (error) {
            reject(`Cloudinary upload failed: ${error.message}`);
          } else if (result) {
            // Ensure result is typed as UploadApiResponse
            resolve(result.secure_url);
          } else {
            reject("No result returned from Cloudinary upload");
          }
        },
      )
      .end(imageBuffer);
  });
};

const deleteImage = async (imageUrl: string) => {};
