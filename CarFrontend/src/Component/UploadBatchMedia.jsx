import React from 'react'

const UploadBatchMedia = ({id}) => {
  return (
    <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-6 mt-6">

        {/* Images */}

        <div>
        <label className="block mb-2 text-sm font-medium">
            Workshop Images
        </label>

        <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full rounded-lg border p-2"
        />

        <p className="text-xs text-gray-500 mt-1">
            Upload minimum 1 and maximum 2 images.
        </p>

        {errors.batch_img && (
            <p className="text-red-500 text-sm mt-1">
            {errors.batch_img}
            </p>
        )}

        {formData.batch_img.length > 0 && (
            <div className="flex gap-3 mt-3">
            {formData.batch_img.map((img, index) => (
                <img
                key={index}
                src={URL.createObjectURL(img)}
                alt=""
                className="w-24 h-24 rounded object-cover border"
                />
            ))}
            </div>
        )}
        </div>

        {/* Video */}

        <div>
        <label className="block mb-2 text-sm font-medium">
            Workshop Video
        </label>

        <input
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            className="w-full rounded-lg border p-2"
        />

        <p className="text-xs text-gray-500 mt-1">
            Upload only one video (maximum 30 seconds).
        </p>

        {errors.batch_video && (
            <p className="text-red-500 text-sm mt-1">
            {errors.batch_video}
            </p>
        )}

        {/* {formData.batch_video && (
            <video
            controls
            className="mt-3 w-full max-h-60 rounded border"
            src={URL.createObjectURL(formData.batch_video)}
            />
        )} */}
        </div>

        </div>
    </div>
  )
}

export default UploadBatchMedia
