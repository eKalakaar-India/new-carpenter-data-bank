import React, { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

/**
 * Drag-and-drop file zone that also opens the file picker on click / Enter.
 *
 * Dropped files bypass the <input accept> attribute, so `kind` ("image" or
 * "video") is checked here too - anything else is rejected via onReject
 * rather than silently passed on.
 *
 * Props:
 *  - kind: "image" | "video"
 *  - multiple: allow several files per drop/pick
 *  - onFiles(files: File[]): called with the accepted files
 *  - onReject(message: string): called when some files were rejected
 *  - title / hint: text shown inside the zone
 *  - disabled
 */
export default function MediaDropzone({
  kind,
  multiple = false,
  onFiles,
  onReject,
  title,
  hint,
  disabled = false,
}) {
  const inputRef = useRef(null);
  const dragDepth = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    const accepted = files.filter((file) => file.type.startsWith(`${kind}/`));
    const rejectedCount = files.length - accepted.length;

    if (rejectedCount > 0) {
      onReject?.(
        `${rejectedCount} file${rejectedCount === 1 ? " was" : "s were"} skipped - only ${kind} files are allowed here.`
      );
    }
    if (accepted.length === 0) return;

    onFiles(multiple ? accepted : accepted.slice(0, 1));
  };

  const openPicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  // dragenter/dragleave fire for every child element, so track depth to
  // avoid the highlight flickering as the pointer moves over the contents.
  const onDragEnter = (e) => {
    e.preventDefault();
    if (disabled) return;
    dragDepth.current += 1;
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setIsDragging(false);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = disabled ? "none" : "copy";
  };

  const onDrop = (e) => {
    e.preventDefault();
    dragDepth.current = 0;
    setIsDragging(false);
    if (!disabled) handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={openPicker}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openPicker();
        }
      }}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={[
        "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors outline-none",
        "focus-visible:ring-2 focus-visible:ring-blue-400",
        disabled
          ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60"
          : isDragging
            ? "cursor-copy border-blue-500 bg-blue-50"
            : "cursor-pointer border-gray-300 hover:border-blue-400 hover:bg-gray-50",
      ].join(" ")}
    >
      <UploadCloud size={28} className={isDragging ? "text-blue-500" : "text-gray-400"} />
      <p className="text-sm font-medium text-gray-700">
        {isDragging ? `Drop ${kind}${multiple ? "s" : ""} here` : title}
      </p>
      {hint && <p className="text-xs text-gray-500">{hint}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={`${kind}/*`}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          // Reset so picking the same file again (after removing it) still fires onChange.
          e.target.value = "";
        }}
      />
    </div>
  );
}
