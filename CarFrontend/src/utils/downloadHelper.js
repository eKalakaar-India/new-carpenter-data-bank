/**
 * File Download Helper
 * Utility for triggering file downloads with proper naming
 */

export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const downloadReport = async (reportData, filename) => {
  try {
    downloadFile(reportData, filename);
  } catch (error) {
    console.error('Download failed:', error);
    throw new Error(`Failed to download ${filename}`);
  }
};

export default {
  downloadFile,
  downloadReport,
};
