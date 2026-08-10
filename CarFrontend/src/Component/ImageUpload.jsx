import { useEffect, useRef, useState } from "react";

export default function ImageUpload({
  name,
  label = "Upload Image",
  watch,
  setValue,
  error,
  defaultImage = null,
}) {
  const fileInputRef = useRef(null);

  const selectedFile = watch(name);

  const [preview, setPreview] = useState(defaultImage);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!selectedFile) {
      setPreview(defaultImage || null);
      return;
    }

    if (selectedFile instanceof File) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [selectedFile, defaultImage]);

  const handleFile = (file) => {
    if (!file) return;
    console.log(file);
    setValue(name, file, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();

    setIsDragging(false);

    const file = e.dataTransfer.files[0];

    handleFile(file);
  };

  const removeImage = () => {
    setValue(name, null, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setPreview(null);
  };

  return (
    <div className="flex flex-col md:col-span-2">

      {label && (
        <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
          {label}  <span className='text-red-900'>*</span>
        </label>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`mt-2 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
          isDragging
            ? "border-teal-500 bg-teal-50"
            : "border-slate-300 bg-white"
        }`}
      >
        {!preview ? (
          <>
            <svg
              className="h-9 w-9 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>

            <p className="mt-3 text-sm text-slate-600">
              Drag your image here, or{" "}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="font-medium text-red-600 hover:text-teal-700"
              >
                browse
              </button>
            </p>

            <p className="mt-1 text-xs text-slate-400">
              .jpeg, .jpg, .png up to 10MB
            </p>
          </>
        ) : (
          <div className="w-full flex flex-col items-center">

            <img
              src={preview}
              alt="Preview"
              className="h-48 rounded-xl object-cover shadow-md"
            />

            {selectedFile instanceof File && (
              <p className="mt-3 text-xs text-slate-500">
                {selectedFile.name}
              </p>
            )}

            <div className="flex gap-3 mt-4">

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg bg-teal-600 px-4 py-2 text-white text-sm hover:bg-teal-700"
              >
                Change
              </button>

              <button
                type="button"
                onClick={removeImage}
                className="rounded-lg bg-red-500 px-4 py-2 text-white text-sm hover:bg-red-600"
              >
                Remove
              </button>

            </div>

          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {error && (
        <span className="text-xs text-red-500 mt-2">
          {error.message}
        </span>
      )}
    </div>
  );
}