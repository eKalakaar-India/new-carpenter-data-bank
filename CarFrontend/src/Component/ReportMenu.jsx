import React, { useState } from 'react';
import { ChevronDown, FileSpreadsheet, FileText, File } from 'lucide-react';
import dashboardService from '../services/dashboardService';
import { downloadFile } from '../utils/downloadHelper';

export default function ReportMenu({ selectedFY, onDownloadStart, onDownloadComplete, onError }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDownload = async (format) => {
    setLoading(true);
    onDownloadStart?.();
    try {
      let blob, filename;

      switch (format) {
        case 'excel':
          blob = await dashboardService.downloadExcelReport(selectedFY);
          filename = `Batch-Report_${selectedFY}_${new Date().toISOString().slice(0, 10)}.xlsx`;
          break;
        case 'word':
          blob = await dashboardService.downloadWordReport(selectedFY);
          filename = `Batch-Report_${selectedFY}_${new Date().toISOString().slice(0, 10)}.docx`;
          break;
        case 'pdf':
          blob = await dashboardService.downloadPDFReport(selectedFY);
          filename = `Batch-Report_${selectedFY}_${new Date().toISOString().slice(0, 10)}.pdf`;
          break;
        default:
          throw new Error('Invalid report format');
      }

      downloadFile(blob, filename);
      onDownloadComplete?.(filename);
      setOpen(false);
    } catch (error) {
      console.error('Download error:', error);
      onError?.(error.message || 'Failed to download report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#DDE3EA] bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
      >
        <span className="text-sm font-semibold">Generate Report</span>
        <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-1 right-0 bg-white border border-[#DDE3EA] rounded-lg shadow-lg z-50 min-w-[180px]">
          <button
            onClick={() => handleDownload('excel')}
            disabled={loading}
            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 border-b border-[#DDE3EA] last:border-b-0 disabled:opacity-50"
          >
            <FileSpreadsheet size={16} className="text-green-600" />
            <span>Excel</span>
          </button>

          <button
            onClick={() => handleDownload('word')}
            disabled={loading}
            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 border-b border-[#DDE3EA] last:border-b-0 disabled:opacity-50"
          >
            <FileText size={16} className="text-blue-600" />
            <span>Word</span>
          </button>

          <button
            onClick={() => handleDownload('pdf')}
            disabled={loading}
            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 border-b border-[#DDE3EA] last:border-b-0 disabled:opacity-50"
          >
            <File size={16} className="text-red-600" />
            <span>PDF</span>
          </button>
        </div>
      )}
    </div>
  );
}
