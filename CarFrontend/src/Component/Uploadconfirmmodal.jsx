import React from 'react';
import { useVaultStore } from "../store/vaultStore";

export default function UploadConfirmModal({ isOpen, onClose }) {
  const {
    selectedFile,
    previewRows,
    previewCount,
    isUploading,
    uploadResult,
    error,
    uploadFile,
    clearSelectedFile,
  } = useVaultStore();

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      await uploadFile();
    } catch {
      // error is already captured in the store and rendered below
    }
  };

  const handleClose = () => {
    if (uploadResult) clearSelectedFile();
    onClose();
  };

  const columns = previewRows.length > 0 ? Object.keys(previewRows[0]) : [];
  const visibleColumns = columns.slice(0, 6);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
        {!uploadResult ? (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-slate-900">Import {previewCount} record{previewCount === 1 ? '' : 's'}?</h2>
            <p className="mt-1 text-sm text-slate-500">
              {selectedFile?.name} will be written to the participants table. This can't be undone from here.
            </p>

            {visibleColumns.length > 0 && (
              <div className="mt-4 max-h-56 overflow-auto rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="sticky top-0 bg-slate-50">
                    <tr>
                      {visibleColumns.map((col) => (
                        <th key={col} className="whitespace-nowrap px-3 py-2 text-left font-medium text-slate-500">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewRows.map((row, i) => (
                      <tr key={i}>
                        {visibleColumns.map((col) => (
                          <td key={col} className="whitespace-nowrap px-3 py-2 text-slate-700">
                            {String(row[col] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {columns.length > visibleColumns.length && (
                  <p className="border-t border-slate-100 px-3 py-1.5 text-[11px] text-slate-400">
                    +{columns.length - visibleColumns.length} more column(s) not shown here
                  </p>
                )}
              </div>
            )}

            {error && (
              <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isUploading}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isUploading}
                className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500 disabled:opacity-60"
              >
                {isUploading && (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                )}
                {isUploading ? 'Importing…' : 'Confirm & Import'}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              {uploadResult.insertedCount > 0 ? 'Import complete' : 'Import finished with issues'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{uploadResult.message}</p>

            <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">Total rows</dt>
                <dd className="mt-0.5 font-semibold text-slate-900">{uploadResult.totalRows}</dd>
              </div>
              <div className="rounded-lg bg-teal-50 p-3">
                <dt className="text-xs text-slate-500">Inserted</dt>
                <dd className="mt-0.5 font-semibold text-teal-700">{uploadResult.insertedCount}</dd>
              </div>
              <div className="rounded-lg bg-red-50 p-3">
                <dt className="text-xs text-slate-500">Skipped</dt>
                <dd className="mt-0.5 font-semibold text-red-700">{uploadResult.invalidRowCount}</dd>
              </div>
            </dl>

            {uploadResult.rowErrors?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-slate-500">Rows that need fixing before re-upload:</p>
                <div className="mt-1 max-h-32 overflow-auto rounded-lg border border-red-100 bg-red-50 p-2.5 text-xs text-red-700">
                  {uploadResult.rowErrors.slice(0, 10).map((e) => (
                    <p key={e.row} className="py-0.5">
                      Row {e.row}: {e.messages.join(', ')}
                    </p>
                  ))}
                  {uploadResult.rowErrors.length > 10 && (
                    <p className="pt-1 text-red-500">+{uploadResult.rowErrors.length - 10} more</p>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}