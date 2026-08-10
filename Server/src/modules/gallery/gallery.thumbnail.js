// gallery.thumbnail.js
import sharp from "sharp";
export async function generateThumbnail(buffer){
 return sharp(buffer).resize({width:300,withoutEnlargement:true}).webp({quality:75}).toBuffer();
}
