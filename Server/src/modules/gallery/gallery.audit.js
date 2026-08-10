// gallery.audit.js
export async function logImageEvent({action,imageId,carpenterId,userId}){
  // Replace with your audit repository
  console.log("[AUDIT]",{action,imageId,carpenterId,userId,at:new Date().toISOString()});
}
