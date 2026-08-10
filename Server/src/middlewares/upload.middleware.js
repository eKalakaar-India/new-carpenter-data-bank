import multer from "multer";
import ApiError from "../utils/ApiError.js";

const storage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {

    const allowed = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ];

    if (!allowed.includes(file.mimetype)) {

        return cb(
            new ApiError(
                400,
                "Only jpg, jpeg, png and webp are allowed."
            )
        );
    }

    cb(null, true);
};

export const uploadSingleImage = multer({

    storage,

    fileFilter: imageFilter,

    limits: {

        fileSize: 5 * 1024 * 1024
    }

}).single("id_img");


export const uploadMultipleImages = multer({

    storage,

    fileFilter: imageFilter,

    limits: {

        fileSize: 5 * 1024 * 1024
    }

}).array("batch_img", 10);