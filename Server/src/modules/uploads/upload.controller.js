import {processExcelUpload, parseWorkbookToRows, normalizeRow} from './upload.service.js';
import participantsRepository from './upload.repository.js';
import { validateExcelFile } from './upload.validation.js';

/**
 * POST /api/participants/upload
 * multipart/form-data, field name: "file"
 */
export async function uploadExcel(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file was uploaded. Attach an .xlsx or .xls file under the "file" field.',
      });
    }
    // console.log(req.user)

    const { error: fileError } = validateExcelFile(req.file);
    if (fileError) {
        return res.status(400).json({ success: false, message: fileError.details[0].message });
    }
    
    console.log("heyyyyyyyyyy")
    // TODO: replace with your real auth context once auth is wired up,
    // e.g. req.user?.id. Falling back to a request body field for now.
    const updatedBy = req.user?.userId;

    const result = await processExcelUpload(req.file.buffer, { updatedBy });
    console.log(result.rowErrors);
    const statusCode = result.insertedCount > 0 ? 201 : 422;

    return res.status(statusCode).json({
      success: result.insertedCount > 0,
      message: `${result.insertedCount} of ${result.totalRows} row(s) imported successfully.`,
      ...result,
    });
  } catch (err) {
    console.error('[participants.controller] uploadExcel failed:', err);
    return res.status(500).json({
      success: false,
      message: err || 'Failed to process the uploaded file.',
    });
  }
}

/**
 * GET /api/participants?page=1&pageSize=20
 */
export async function listParticipants(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 20;

    const result = await listParticipants({ page, pageSize });
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error('[participants.controller] listParticipants failed:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/participants/batch/:batchId
 */
export async function getBatch(req, res) {
  try {
    const { batchId } = req.params;
    const data = await getParticipantsByBatchId(batchId);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('[participants.controller] getBatch failed:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}
