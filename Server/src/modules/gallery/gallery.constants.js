export const IMAGE_CONFIG = {
  ALLOWED_MIME_TYPES: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ],

  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5 MB

  MAX_FILES: 10,

  STORAGE_FOLDERS: {
    PROFILE: "profile",
    AADHAAR: "aadhaar",
    WORKSHOP: "workshop",
    OTHER: "other",
  },

  IMAGE_TYPES: [
    "PROFILE",
    "AADHAAR",
    "WORKSHOP",
    "OTHER",
  ],
};