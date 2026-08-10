import xlsx from 'xlsx';
import ApiError from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../utils/constants.js';
import { logger } from '../../utils/logger.js';
import LinksRepository from './links.repository.js';
import { certificateLinkRowSchema, insuranceLinkRowSchema } from './links.validation.js';

// How many updates run concurrently against Supabase at once. Each row needs
// its own update call (every row has a different link value, so a single
// bulk .update() can't do it) - this caps how many run in parallel so a
// large sheet doesn't fire hundreds of requests at the same time.
const CONCURRENCY = 20;

class LinksService {
  constructor() {
    this.repository = new LinksRepository();
  }

  /**
   * ASSUMPTION: uses the `xlsx` package directly. If your existing
   * /upload/preview flow already has a shared spreadsheet-parsing utility,
   * point me to it and I'll use that instead of a second parsing path.
   */
  parseWorkbook(fileBuffer) {
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    return xlsx.utils.sheet_to_json(sheet, { defval: '' });
  }

  validateRows(rawRows, schema) {
    const validRows = [];
    const invalidRows = [];

    rawRows.forEach((row, index) => {
      const result = schema.safeParse(row);
      if (result.success) {
        validRows.push(result.data);
      } else {
        invalidRows.push({
          row: index + 2, // +2: 1-indexed rows, plus the header row
          errors: result.error.issues.map((issue) => issue.message),
        });
      }
    });

    return { validRows, invalidRows };
  }

  async processInBatches(items, worker) {
    const results = [];
    for (let i = 0; i < items.length; i += CONCURRENCY) {
      const batch = items.slice(i, i + CONCURRENCY);
      const batchResults = await Promise.all(batch.map(worker));
      results.push(...batchResults);
    }
    return results;
  }

  async uploadCertificateLinks(fileBuffer, user) {
    if (!fileBuffer) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'An Excel file is required');
    }

    const rawRows = this.parseWorkbook(fileBuffer);
    if (rawRows.length === 0) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'The uploaded file has no data rows');
    }

    const { validRows, invalidRows } = this.validateRows(rawRows, certificateLinkRowSchema);
    const existingIds = new Set(await this.repository.findExistingIds(validRows.map((row) => row.id)));

    const toUpdate = validRows.filter((row) => existingIds.has(row.id));
    const notFound = validRows.filter((row) => !existingIds.has(row.id)).map((row) => row.id);

    const updated = await this.processInBatches(toUpdate, async (row) => {
      await this.repository.updateCertificateLink(row.id, row.certificate_link);
      return row.id;
    });

    logger.info(
      { updatedCount: updated.length, notFoundCount: notFound.length, userId: user?.userId },
      'Certificate links bulk-uploaded'
    );

    return { totalRows: rawRows.length, updated: updated.length, notFound, invalidRows };
  }

  async uploadInsuranceLinks(fileBuffer, user) {
    if (!fileBuffer) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'An Excel file is required');
    }

    const rawRows = this.parseWorkbook(fileBuffer);
    if (rawRows.length === 0) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'The uploaded file has no data rows');
    }

    const { validRows, invalidRows } = this.validateRows(rawRows, insuranceLinkRowSchema);
    const existingIds = new Set(await this.repository.findExistingIds(validRows.map((row) => row.id)));

    const toUpdate = validRows.filter((row) => existingIds.has(row.id));
    const notFound = validRows.filter((row) => !existingIds.has(row.id)).map((row) => row.id);

    const updated = await this.processInBatches(toUpdate, async (row) => {
      const insuranceLinks = {};
      if (row['M-Swasth']) insuranceLinks['M-Swasth'] = row['M-Swasth'];
      if (row.Niva) insuranceLinks.Niva = row.Niva;
      await this.repository.updateInsuranceLinks(row.id, insuranceLinks);
      return row.id;
    });

    logger.info(
      { updatedCount: updated.length, notFoundCount: notFound.length, userId: user?.userId },
      'Insurance links bulk-uploaded'
    );

    return { totalRows: rawRows.length, updated: updated.length, notFound, invalidRows };
  }
}

export default LinksService;