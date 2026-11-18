import React from "react";
import { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { useVaultStore } from "../store/vaultStore";
import MediaDropzone from "./MediaDropzone";

// Must match Server/src/middlewares/uploadVideo.middleware.js
const MAX_IMAGES = 2;
const MAX_FILE_BYTES = 50 * 1024 * 1024;
const MAX_VIDEO_SECONDS = 30;

const formatSize = (bytes) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

export default function CreateBatchModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mobilisers = [],
}) {
  const [formData, setFormData] = useState({
  workshop_date: "",
  status: "PLANNED",
  trainer_name: "",
  trainer_phoneno: "",
  mobiliser_id: "",
  state: "",
  district: "",
  city_town: "",
  center: "",
  full_address: "",
  batch_img: [],
  batch_video: null,
  remarks:""
});

const [errors, setErrors] = useState({
  batch_img: "",
  batch_video: "",
});


useEffect(() => {
  if (initialData) {
    setFormData({
      id: initialData.id,
      workshop_date: initialData.workshop_date || "",
      status: initialData.status || "PLANNED",
      trainer_name: initialData.trainer_name || "",
      trainer_phoneno: initialData.trainer_phoneno || "",
      mobiliser_id: initialData.mobiliser_id || "",
      state: initialData.state || "",
      district: initialData.district || "",
      city_town: initialData.city_town || "",
      center:initialData.center || "",
      full_address: initialData.full_address || "",
      batch_img: initialData?.batch_img || [],
      batch_video: initialData?.batch_video || null,
      remarks:initialData.remarks || ""
    });
  } else {
    setFormData({
      workshop_date: "",
      status: "PLANNED",
      trainer_name: "",
      trainer_phoneno: "",
      mobiliser_id: "",
      state: "",
      district: "",
      city_town: "",
      center: "",
      full_address: "",
      batch_img: [],
      batch_video: null,
      remarks: ""
    });
  }
}, [initialData]);

  const {
    userMobilisers
  } = useVaultStore();

  // Newly picked files vs. paths already stored on the batch. Any new upload
  // replaces the stored images on the server, so the two are never mixed.
  const newImages = useMemo(
    () => (Array.isArray(formData.batch_img) ? formData.batch_img.filter((img) => img instanceof File) : []),
    [formData.batch_img]
  );
  const storedImageCount = Array.isArray(formData.batch_img)
    ? formData.batch_img.filter((img) => typeof img === "string").length
    : 0;
  const newVideo = formData.batch_video instanceof File ? formData.batch_video : null;
  const hasStoredVideo = typeof formData.batch_video === "string" && formData.batch_video !== "";

  // Object URLs for previews - created once per file and revoked on change/unmount.
  const imagePreviews = useMemo(() => newImages.map((file) => URL.createObjectURL(file)), [newImages]);
  useEffect(() => () => imagePreviews.forEach((url) => URL.revokeObjectURL(url)), [imagePreviews]);
  const videoPreview = useMemo(() => (newVideo ? URL.createObjectURL(newVideo) : null), [newVideo]);
  useEffect(() => () => videoPreview && URL.revokeObjectURL(videoPreview), [videoPreview]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    console.log(`Field ${e.target.name} changed to:`, e.target.value);
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const setFieldError = (field, message) =>
    setErrors((prev) => ({ ...prev, [field]: message }));

  // Adds dropped/picked images to the ones already chosen, up to MAX_IMAGES.
  const handleImageFiles = (files) => {
    const messages = [];

    const withinSize = files.filter((file) => file.size <= MAX_FILE_BYTES);
    if (withinSize.length < files.length) {
      messages.push(`${files.length - withinSize.length} image(s) skipped - each must be under ${formatSize(MAX_FILE_BYTES)}.`);
    }

    const combined = [...newImages, ...withinSize];
    if (combined.length > MAX_IMAGES) {
      messages.push(`Only ${MAX_IMAGES} images are allowed - extra images were skipped.`);
    }

    setFieldError("batch_img", messages.join(" "));
    if (withinSize.length === 0) return;

    setFormData((prev) => ({ ...prev, batch_img: combined.slice(0, MAX_IMAGES) }));
  };

  const removeImage = (index) => {
    setFieldError("batch_img", "");
    const remaining = newImages.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      // Removing every new image falls back to whatever was already saved.
      batch_img: remaining.length > 0 ? remaining : initialData?.batch_img || [],
    }));
  };

  const handleVideoFiles = ([file]) => {
    if (!file) return;

    if (file.size > MAX_FILE_BYTES) {
      setFieldError("batch_video", `Video must be under ${formatSize(MAX_FILE_BYTES)} (this one is ${formatSize(file.size)}).`);
      return;
    }

    const video = document.createElement("video");
    video.preload = "metadata";
    const probeUrl = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(probeUrl);

      if (video.duration > MAX_VIDEO_SECONDS) {
        setFieldError("batch_video", `Video must be ${MAX_VIDEO_SECONDS} seconds or shorter (this one is ${Math.round(video.duration)}s).`);
        return;
      }

      setFieldError("batch_video", "");
      setFormData((prev) => ({ ...prev, batch_video: file }));
    };

    video.onerror = () => {
      URL.revokeObjectURL(probeUrl);
      setFieldError("batch_video", "This video couldn't be read. Please try an MP4 file.");
    };

    video.src = probeUrl;
  };

  const removeVideo = () => {
    setFieldError("batch_video", "");
    setFormData((prev) => ({ ...prev, batch_video: initialData?.batch_video || null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.status === "COMPLETED") {
      if (!Array.isArray(formData.batch_img) || formData.batch_img.length < 1) {
        setErrors((prev) => ({
          ...prev,
          batch_img: "Please upload at least 1 image.",
        }));
        return;
      }
    }
    console.log("Submitting form data:", formData);
    onSubmit(formData);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-10 overflow-y-scroll"
      // A file dropped outside a dropzone would otherwise make the browser
      // navigate away to open it, discarding the form.
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
    >
      <div className="w-full max-w-4xl rounded-xl bg-white shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-semibold">
            Create New Batch
          </h2>

          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-black"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">

            {/* Workshop Date */}

            <div>
              <label className="mb-1 block text-sm font-medium">
                Workshop Date
              </label>

              <input
                type="date"
                name="workshop_date"
                value={formData.workshop_date}
                onChange={handleChange}
                // disabled = {initialData && initialData.workshop_date}
                className="w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            {/* Status */}

            <div>
              <label className="mb-1 block text-sm font-medium">
                Status
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2"
                required
              >
                <option value="PLANNED">Planned</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Trainer */}

            <div>
              <label className="mb-1 block text-sm font-medium">
                Trainer Name
              </label>

              <input
                type="text"
                name="trainer_name"
                value={formData.trainer_name}
                onChange={handleChange}
                placeholder="Trainer Name"
                className="w-full rounded-lg border px-3 py-2"
                disabled={initialData && initialData.trainer_name}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Trainer Phone Number
              </label>

              <input
                type="tel"
                name="trainer_phoneno"
                value={formData.trainer_phoneno}
                onChange={handleChange}
                placeholder="Trainer Phone Number"
                className="w-full rounded-lg border px-3 py-2"
                disabled = {initialData && initialData.trainer_phoneno}
                required
              />
            </div>

            {/* Mobilizer */}

            <div>
              <label className="mb-1 block text-sm font-medium">
                Mobilizer
              </label>

              <select
                name="mobiliser_id"
                value={formData.mobiliser_id}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2"
                disabled={initialData && initialData.mobiliser_id}
                required
              >
                <option value="">Select Mobilizer</option>

                {userMobilisers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* State */}

            <div>
              <label className="mb-1 block text-sm font-medium">
                State
              </label>

              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
                className="w-full rounded-lg border px-3 py-2"
                disabled={initialData && initialData.state}
                required
              />
            </div>

            {/* District */}

            <div>
              <label className="mb-1 block text-sm font-medium">
                District
              </label>

              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="District"
                className="w-full rounded-lg border px-3 py-2"
                disabled ={initialData && initialData.district}
                required
              />
            </div>

            {/* City */}

            <div>
              <label className="mb-1 block text-sm font-medium">
                City / Town
              </label>

              <input
                type="text"
                name="city_town"
                value={formData.city_town}
                onChange={handleChange}
                placeholder="City"
                className="w-full rounded-lg border px-3 py-2"
                disabled = {initialData && initialData.city_town}
                required
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                Center
              </label>

              <select
                name="center"
                value={formData.center}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2"
                required
              >
                <option value="">Select a Center</option>
                <option value="EBCO CDC Center">EBCO CDC Center</option>
                <option value="EBCO NDC Center">EBCO NDC Center</option>
                <option value="Pantiss Center, Thane">Pantiss Center, Thane</option>
                <option value="Others">Others</option>
              </select>
            </div>
            {/* Address */}

            <div>

              <label className="mb-1 block text-sm font-medium">
                Full Address
              </label>

              <textarea
                rows={4}
                name="full_address"
                value={formData.full_address}
                onChange={handleChange}
                placeholder="Complete address..."
                className="w-full rounded-lg border px-3 py-2"
                disabled={initialData && initialData.full_address}
                required
              />
            </div>
            <div>

              <label className="mb-1 block text-sm font-medium">
                Brief of the training:
              </label>

              <textarea
                rows={4}
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Brief of the training..."
                className="w-full rounded-lg border px-3 py-2"
                disabled={initialData && initialData.full_address}
              />
            </div>

          </div>

{/* Media Upload Fields */}
            {formData.status === 'COMPLETED' && (
              <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2 border-t border-[#E8ECF2]">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Workshop Images{" "}
                    <span className="font-normal text-gray-500">({newImages.length}/{MAX_IMAGES})</span>
                  </label>
                  <MediaDropzone
                    kind="image"
                    multiple
                    onFiles={handleImageFiles}
                    onReject={(msg) => setFieldError("batch_img", msg)}
                    disabled={newImages.length >= MAX_IMAGES}
                    title={newImages.length >= MAX_IMAGES
                      ? `Maximum ${MAX_IMAGES} images added`
                      : "Drag & drop images here, or click to browse"}
                    hint={`Up to ${MAX_IMAGES} images, ${formatSize(MAX_FILE_BYTES)} each`}
                  />
                  {storedImageCount > 0 && newImages.length === 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      {storedImageCount} image{storedImageCount === 1 ? " is" : "s are"} already saved for this batch. Adding new images will replace {storedImageCount === 1 ? "it" : "them"}.
                    </p>
                  )}
                  {errors.batch_img && (
                    <p className="text-red-500 text-sm mt-1">{errors.batch_img}</p>
                  )}
                  {newImages.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-3">
                      {newImages.map((file, index) => (
                        <div key={`${file.name}-${file.lastModified}-${index}`} className="relative">
                          <img
                            src={imagePreviews[index]}
                            alt={file.name}
                            title={`${file.name} (${formatSize(file.size)})`}
                            className="h-24 w-24 rounded-xl object-cover border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            aria-label={`Remove ${file.name}`}
                            className="absolute -top-2 -right-2 rounded-full bg-white border shadow p-1 text-gray-600 hover:text-red-600"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Workshop Video <span className="font-normal text-gray-500">(optional)</span>
                  </label>
                  {newVideo ? (
                    <div className="relative">
                      <video
                        controls
                        className="w-full max-h-60 rounded-xl border"
                        src={videoPreview}
                      />
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                        <span className="truncate">{newVideo.name} ({formatSize(newVideo.size)})</span>
                        <button
                          type="button"
                          onClick={removeVideo}
                          className="ml-3 shrink-0 text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <MediaDropzone
                      kind="video"
                      onFiles={handleVideoFiles}
                      onReject={(msg) => setFieldError("batch_video", msg)}
                      title="Drag & drop a video here, or click to browse"
                      hint={`One video, up to ${MAX_VIDEO_SECONDS} seconds and ${formatSize(MAX_FILE_BYTES)}`}
                    />
                  )}
                  {hasStoredVideo && !newVideo && (
                    <p className="text-xs text-gray-500 mt-2">
                      A video is already saved for this batch. Adding a new one will replace it.
                    </p>
                  )}
                  {errors.batch_video && (
                    <p className="text-red-500 text-sm mt-1">{errors.batch_video}</p>
                  )}
                </div>
              </div>
            )}

            {/* Footer */}

          <div className="mt-6 flex justify-end gap-3 border-t px-6 py-4">

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-5 py-2 hover:bg-gray-100"
            >
              Cancel
            </button>

            {
              initialData?.workshop_date ? 
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
              >
                Update Batch Status
              </button> : 
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
              >
                Create Batch
              </button>
            }
            
            
            

          </div>

        </form>

      </div>
    </div>
  );
}