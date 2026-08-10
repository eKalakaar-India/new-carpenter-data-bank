import React, { useRef, useState } from 'react';
import { useVaultStore } from '../store/vaultStore';
import UploadConfirmModal from '../Component/Uploadconfirmmodal';

const VALID_EXTENSIONS = ['.xlsx', '.xls', '.XLSX', '.XLS', '.Xls', '.Xls', '.XLS', '.XLSX', '.XLSM', '.XLSB', '.XLTX', '.XLTM', '.XLSX', '.XLSM', '.XLSB', '.XLTX', '.XLTM'];

export default function ParticipantsUploadPage() {
  const fileInputRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const {
    selectedFile,
    previewCount,
    isParsing,
    error,
    setSelectedFile,
    clearSelectedFile,
  } = useVaultStore();

  const handleFile = (file) => {
    if (!file) return;
    const isValid = VALID_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!isValid) {
      useVaultStore.setState({ error: 'That file type is not supported. Choose an .xlsx or .xls file.' });
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-teal-600">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
          Participants
        </div>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Upload participants</h1>
        <p className="mt-1 text-sm text-slate-500">
          Import an Excel sheet to add records to the participants table. You'll see a preview before anything is saved.
        </p>

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`mt-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
            isDragging ? 'border-teal-500 bg-teal-50' : 'border-slate-300 bg-white'
          }`}
        >
          <svg className="h-9 w-9 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
          <p className="mt-3 text-sm text-slate-600">
            Drag your file here, or{' '}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="font-medium text-teal-600 hover:text-teal-700"
            >
              browse
            </button>
          </p>
          <p className="mt-1 text-xs text-slate-400">.xlsx or .xls, up to 10MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>

        {isParsing && <p className="mt-4 text-sm text-slate-500">Reading file…</p>}

        {error && !isParsing && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        {selectedFile && !isParsing && (
          <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{selectedFile.name}</p>
              <p className="text-xs text-slate-500">
                {(selectedFile.size / 1024).toFixed(1)} KB · {previewCount} row{previewCount === 1 ? '' : 's'} detected
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={clearSelectedFile}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Remove
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-500"
              >
                Review & import
              </button>
            </div>
          </div>
        )}
      </div>

      <UploadConfirmModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}