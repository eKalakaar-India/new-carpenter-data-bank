import React, { useCallback, useEffect, useMemo } from 'react';
import { useVaultStore } from '../store/vaultStore';

const MAX_VISIBLE_ISSUES = 10;

const ISSUE_LABELS = { duplicate: 'Duplicate', invalid: 'Invalid', insert: 'Insert failed' };

const TONE_STYLES = {
  success: { title: 'Import complete', banner: 'bg-teal-50 text-teal-800' },
  warning: { title: 'Imported with skipped rows', banner: 'bg-amber-50 text-amber-800' },
  error: { title: 'No records were imported', banner: 'bg-red-50 text-red-700' },
};

// Normalises the server's { row, messages } / string shapes into one list item shape
const toIssues = (list, type) =>
  (Array.isArray(list) ? list : []).map((item, i) => ({
    key: `${type}-${item?.row ?? i}`,
    type,
    row: item?.row ?? null,
    messages: Array.isArray(item?.messages)
      ? item.messages
      : [item?.message ?? (typeof item === 'string' ? item : 'Unknown error')],
  }));

function summariseResult(r) {
  const inserted = r.insertedCount ?? 0;
  const duplicates = r.duplicateRowCount ?? 0;
  const errors = (r.invalidRowCount ?? 0) + (r.insertErrors?.length ?? 0);

  let tone = 'success';
  if (inserted === 0) tone = 'error';
  else if (duplicates + errors > 0) tone = 'warning';

  const issues = [
    ...toIssues(r.duplicateRows, 'duplicate'),
    ...toIssues(r.rowErrors, 'invalid'),
    ...toIssues(r.insertErrors, 'insert'),
  ].sort(
    (a, b) =>
      (a.row ?? Number.MAX_SAFE_INTEGER) - (b.row ?? Number.MAX_SAFE_INTEGER),
  );

  return {
    tone,
    total: r.totalRows ?? 0,
    inserted,
    duplicates,
    errors,
    issues,
    message: r.message ?? 'Import finished.',
  };
}

function Stat({ label, value, tone = 'bg-slate-50 text-slate-900' }) {
  return (
    <div className={`rounded-lg p-3 ${tone}`}>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 font-semibold">{value}</dd>
    </div>
  );
}

function IssueList({ issues, hasDuplicates }) {
  if (issues.length === 0) return null;
  const visible = issues.slice(0, MAX_VISIBLE_ISSUES);
  const hidden = issues.length - visible.length;

  return (
    <div className="mt-4">
      <p className="text-xs font-medium text-slate-500">Skipped rows (not imported):</p>
      <ul className="mt-1 max-h-40 divide-y divide-red-100 overflow-auto rounded-lg border border-red-100 bg-red-50 text-xs text-red-700">
        {visible.map(({ key, type, row, messages }) => (
          <li key={key} className="flex gap-2 px-2.5 py-1.5">
            <span className="shrink-0 rounded bg-white/70 px-1.5 py-0.5 font-medium">
              {ISSUE_LABELS[type]}
            </span>
            <span>
              {row != null && `Row ${row}: `}
              {messages.join(', ')}
            </span>
          </li>
        ))}
        {hidden > 0 && <li className="px-2.5 py-1.5 text-red-500">+{hidden} more</li>}
      </ul>
      {hasDuplicates && (
        <p className="mt-1.5 text-[11px] text-slate-400">
          Duplicate rows already exist and can be removed from the file. Fix any
          invalid rows and re-upload.
        </p>
      )}
    </div>
  );
}

export default function UploadConfirmModal({ isOpen, onClose }) {
  const {
    selectedFile,
    previewRows,
    previewCount,
    isUploading,
    uploadResult,
    error, // was missing
    uploadFile,
    clearSelectedFile,
  } = useVaultStore();

  const result = useMemo(
    () => (uploadResult ? summariseResult(uploadResult) : null),
    [uploadResult],
  );

  const handleClose = useCallback(() => {
    if (isUploading) return;
    if (uploadResult) clearSelectedFile();
    onClose();
  }, [isUploading, uploadResult, clearSelectedFile, onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => e.key === 'Escape' && handleClose();
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null; // keep all hooks above this line

  const handleConfirm = () => uploadFile();

  const columns = previewRows.length > 0 ? Object.keys(previewRows[0]) : [];
  const visibleColumns = columns.slice(0, 6);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-2xl bg-white shadow-xl"
      >
        {!uploadResult ? (
          <div className="p-6">
            <h2 id="upload-modal-title" className="text-lg font-semibold text-slate-900">Import {previewCount} record{previewCount === 1 ? '' : 's'}?</h2>
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
              <p role="alert" className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>

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
                {isUploading ? 'Importing…' : error ? 'Retry import' : 'Confirm & Import'}
              </button>
            </div>
          </div>
                ) : (
          <div className="p-6">
            <h2 id="upload-modal-title" className="text-lg font-semibold text-slate-900">
              {TONE_STYLES[result.tone].title}
            </h2>
            <p role="status" className={`mt-2 rounded-md px-3 py-2 text-sm ${TONE_STYLES[result.tone].banner}`}>
              {result.message}
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              <Stat label="Total rows" value={result.total} />
              <Stat label="Inserted" value={result.inserted} tone="bg-teal-50 text-teal-700" />
              <Stat label="Duplicates" value={result.duplicates} tone="bg-amber-50 text-amber-700" />
              <Stat label="Errors" value={result.errors} tone="bg-red-50 text-red-700" />
            </dl>

            <IssueList issues={result.issues} hasDuplicates={result.duplicates > 0} />

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