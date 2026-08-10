import React, { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { useVaultStore } from '../store/vaultStore';

/**
 * One upload card - file picker, upload button, and a results summary once
 * the store's upload action resolves. Shared by both link types below
 * rather than duplicating the same markup twice.
 */
function LinkUploadCard({ title, description, columnsHint, uploadState, onUpload }) {
  const inputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const { loading, error, result } = uploadState;

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files?.[0] || null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch {
      // Error is already captured in uploadState.error and rendered below.
    }
  };

  return (
    <div className="vault-card flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <FileSpreadsheet size={14} className="text-[var(--accent-primary)]" />
          <span>{title}</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">{description}</p>
        <p className="text-[11px] text-slate-400 mt-1">
          Expected columns: <span className="font-semibold text-slate-500">{columnsHint}</span>
        </p>
      </div>

      <label className="flex items-center justify-center gap-2 border-2 border-dashed border-[#DDE3EA] rounded-xl py-6 cursor-pointer hover:border-[var(--accent-primary)]/40 transition-colors">
        <UploadCloud size={18} className="text-slate-400" />
        <span className="text-xs font-medium text-slate-500 truncate max-w-[80%]">
          {selectedFile ? selectedFile.name : 'Click to choose an Excel file (.xlsx, .xls)'}
        </span>
        <input ref={inputRef} type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" />
      </label>

      <button
        type="button"
        onClick={handleUpload}
        disabled={!selectedFile || loading}
        className="btn-gold justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>{loading ? 'Uploading...' : 'Upload & Process'}</span>
      </button>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-650">
          <XCircle size={14} className="mt-0.5 shrink-0" />
          <span className="text-xs">{error}</span>
        </div>
      )}

      {result && (
        <div className="flex flex-col gap-2 p-3 rounded-lg bg-teal-50 border border-teal-100">
          <div className="flex items-center gap-2 text-teal-650">
            <CheckCircle2 size={14} className="shrink-0" />
            <span className="text-xs font-semibold">
              {result.updated} of {result.totalRows} row{result.totalRows === 1 ? '' : 's'} updated
            </span>
          </div>

          {result.notFound?.length > 0 && (
            <div className="flex items-start gap-2 text-amber-700">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span className="text-[11px]">
                {result.notFound.length} id(s) not found: {result.notFound.slice(0, 10).join(', ')}
                {result.notFound.length > 10 ? ', …' : ''}
              </span>
            </div>
          )}

          {result.invalidRows?.length > 0 && (
            <div className="flex items-start gap-2 text-amber-700">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span className="text-[11px]">
                {result.invalidRows.length} row(s) failed validation - e.g. row {result.invalidRows[0].row}:{' '}
                {result.invalidRows[0].errors[0]}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LinksUpload() {
  const { certificateLinksUpload, insuranceLinksUpload, uploadCertificateLinks, uploadInsuranceLinks } =
    useVaultStore();

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="font-serif text-3xl font-bold tracking-wide text-slate-900">
          Bulk Link <span className="font-normal italic text-[var(--accent-primary)]">Ingestion</span>
        </h2>
        <p className="text-slate-550 text-xs mt-1 uppercase tracking-wider font-medium">
          Attach certificate and insurance links to existing carpenter records
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LinkUploadCard
          title="Certificate Links"
          description="Upload an Excel sheet mapping carpenter IDs to their certificate link."
          columnsHint="id, certificate_link"
          uploadState={certificateLinksUpload}
          onUpload={uploadCertificateLinks}
        />
        <LinkUploadCard
          title="Insurance Links"
          description="Upload an Excel sheet mapping carpenter IDs to their M-Swasth and/or Niva insurance links."
          columnsHint="id, M-Swasth, Niva"
          uploadState={insuranceLinksUpload}
          onUpload={uploadInsuranceLinks}
        />
      </div>
    </div>
  );
}