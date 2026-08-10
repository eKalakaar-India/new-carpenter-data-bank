import React from "react";
import { useState, useEffect } from "react";
import { useVaultStore } from "../store/vaultStore";
import ImageUpload from './ImageUpload'

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

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    if (files.length < 1) {
      setErrors((prev) => ({
        ...prev,
        batch_img: "Please upload at least one image.",
      }));
      return;
    }

    setErrors((prev) => ({
      ...prev,
      batch_img: "",
    }));

    setFormData((prev) => ({
      ...prev,
      batch_img: files,
    }));
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);

      if (video.duration > 30) {
        setErrors((prev) => ({
          ...prev,
          batch_video: "Video must be less than 30 seconds.",
        }));

        e.target.value = "";

        return;
      }

      setErrors((prev) => ({
        ...prev,
        batch_video: "",
      }));

      setFormData((prev) => ({
        ...prev,
        batch_video: file,
      }));
    };

    video.src = URL.createObjectURL(file);
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
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-10 overflow-y-scroll">
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
                  <label className="mb-2 block text-sm font-medium">Workshop Images</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full rounded-lg border px-3 py-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload one or more images.
                  </p>
                  {errors.batch_img && (
                    <p className="text-red-500 text-sm mt-1">{errors.batch_img}</p>
                  )}
                  {Array.isArray(formData.batch_img) && formData.batch_img.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-3">
                      {formData.batch_img.map((img, index) => {
                        const src = img instanceof File ? URL.createObjectURL(img) : img;
                        return (
                          <img
                            key={index}
                            src={src}
                            alt={`batch-img-${index}`}
                            className="h-24 w-24 rounded-xl object-cover border"
                          />
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Workshop Video</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="w-full rounded-lg border px-3 py-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional video upload (maximum 30 seconds).
                  </p>
                  {errors.batch_video && (
                    <p className="text-red-500 text-sm mt-1">{errors.batch_video}</p>
                  )}
                  {formData.batch_video && formData.batch_video instanceof File && (
                    <video
                      controls
                      className="mt-3 w-full max-h-60 rounded-xl border"
                      src={URL.createObjectURL(formData.batch_video)}
                    />
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