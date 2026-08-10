// gallery.hash.js
import crypto from "crypto";
export const createFileHash=(buffer)=>crypto.createHash("sha256").update(buffer).digest("hex");
