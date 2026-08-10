// gallery.service.js
import crypto from "crypto";
import sharp from "sharp";
import { supabase } from "../../config/supabase.js";
import { GalleryRepository } from "./gallery.repository.js";
import { optimizeImage } from "../../utils/imageOptimizer.js";
import { generateFileName } from "../../utils/generateFileName.js";
import { uploadToSupabase } from "../../utils/uploadToSupabase.js";
import { deleteFromSupabase } from "../../utils/deleteFromSupabase.js";
import * as helper from "./gallery.helper.js";
import * as audit from "./gallery.audit.js";
import path from "path";

const VIDEO_BUCKET = "carpenters";

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime", // .mov
];

const MAX_VIDEO_SIZE = 50 * 1024 * 1024;


export async function uploadSingleImage({file, imageType, uploadedBy, batch}) {
  let storagePath;
  try {
    const optimized=await optimizeImage(file.buffer);
    const meta=await sharp(optimized).metadata();
    const hash=helper.sha256(optimized);
    if(batch){
      storagePath = await generateFileName(file.originalname, imageType,`images/batch_imgs/images`);
    }else{
      storagePath = await generateFileName(file.originalname,imageType,`images/id_imgs`);
    }
    const uploaded = await uploadToSupabase(optimized,storagePath,imageType);
    // const image=await GalleryRepository.create({
    //   image_type:imageType,
    //   original_name:file.originalname,stored_name:storagePath.split("/").pop(),
    //   storage_path:uploaded.storagePath,public_url:uploaded.publicUrl,
    //   mime_type:"image/webp",file_size:optimized.length,
    //   width:meta.width,height:meta.height,file_hash:hash,uploaded_by:uploadedBy
    // });
    await audit.logImageEvent({action:"UPLOAD",imageId:storagePath,userId:uploadedBy});
    return uploaded;
  } catch(e){
    if(storagePath) await deleteFromSupabase(storagePath).catch(()=>{});
    throw e;
  }
}

export async function uploadSingleVideo(file) {
  if (!file) {
    throw new Error("Video file is required.");
  }

  if (!ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
    throw new Error("Only MP4, MOV and WEBM videos are allowed.");
  }

  if (file.size > MAX_VIDEO_SIZE) {
    throw new Error("Video size cannot exceed 50MB.");
  }

  const extension = path.extname(file.originalname);

  const fileName = `BAT-VID-${Date.now()}.${extension}`;

  const filePath = `images/batch_imgs/videos/${fileName}`;

  const { error } = await supabase.storage
    .from(VIDEO_BUCKET)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from(VIDEO_BUCKET)
    .getPublicUrl(filePath);

  return {
    fileName,
    filePath,
    publicUrl,
  };
}

export async function uploadMultipleImages({files, uploadedBy}){
  return Promise.all(
    files.map((f) => uploadSingleImage({ file: f, imageType: f.mimetype, uploadedBy, batch: true }))
  );
}

export async function getImages(carpenterId){
  return GalleryRepository.findByCarpenter(carpenterId);
}

export async function deleteImage(imageId,userId){
  const img=await GalleryRepository.findById(imageId);
  if(!img) throw new Error("Image not found");
  await deleteFromSupabase(img.storage_path);
  await GalleryRepository.remove(imageId);
  await audit.logImageEvent({action:"DELETE",imageId,carpenterId:img.carpenter_id,userId});
  return true;
}

export async function replaceImage(args){
  const existing=await GalleryRepository.findByType(args.carpenterId,args.imageType);
  if(existing) await deleteImage(existing.id,args.uploadedBy);
  return uploadSingleImage(args);
}
