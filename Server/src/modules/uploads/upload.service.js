import crypto from 'crypto';
import XLSX from 'xlsx';
import  {validateParticipantRow}  from './upload.validation.js';
import participantsRepository from './upload.repository.js';
import { generateCandidateId } from "../../utils/generateCandidateIds.js";
import { HTTP_STATUS } from '../../utils/constants.js';
import { logger } from '../../utils/logger.js';
import { supabase } from '../../config/supabase.js';


const INSERT_CHUNK_SIZE = 600;

/**
 * Reads the first sheet of a workbook buffer into an array of plain
 * objects keyed by the header row. Cells come back as formatted strings
 * (raw: false) so downstream validation/coercion has one consistent type
 * to work with, instead of a mix of numbers/strings/Date objects.
 */
export function parseWorkbookToRows(fileBuffer) {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer', cellDates: true });
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error('The uploaded file does not contain any sheets.');
  }

  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet, {
    defval: '',
    raw: false,
    dateNF: 'yyyy-mm-dd',
  });
}

/**
 * Lower-cases/underscores header keys (so "First Name" and "first_name"
 * both map to first_name), trims strings, turns blanks into null, and
 * fills in a couple of derived fields when the sheet left them out.
 */
export function normalizeRow(rawRow) {
  const normalized = {};

  Object.keys(rawRow).forEach((key) => {
    const cleanKey = key.trim().toLowerCase().replace(/\s+/g, '_');
    let value = rawRow[key];
    if (typeof value === 'string') value = value.trim();
    normalized[cleanKey] = value === '' ? null : value;
  });

  if (!normalized.full_name) {
    normalized.full_name =
      [normalized.first_name, normalized.middle_name, normalized.last_name]
        .filter(Boolean)
        .join(' ') || null;
  }

  if (!normalized.nominee_full_name) {
    normalized.nominee_full_name =
      [normalized.nominee_first_name, normalized.nominee_middle_name, normalized.nominee_last_name]
        .filter(Boolean)
        .join(' ') || null;
  }

  ['has_certificate', 'has_insurance'].forEach((field) => {
    if (typeof normalized[field] === 'string') {
      normalized[field] = ['yes', 'true', '1'].includes(normalized[field].toLowerCase());
    }
  });

  if (normalized.id_no != null) {
    normalized.id_no = String(normalized.id_no).replace(/\s+/g, '').toUpperCase() || null;
  }

  if (normalized.mobile_no != null) {
    const digits = String(normalized.mobile_no).replace(/\D/g, '');
    normalized.mobile_no = digits ? digits.slice(-10) : null; // drops +91 / leading 0
  }

  return normalized;
}

/**
 * Full pipeline: parse -> normalize -> validate -> insert in chunks.
 *
 * @param {Buffer} fileBuffer - raw .xlsx/.xls file contents (from multer)
 * @param {Object} options
 * @param {string} [options.updatedBy] - identifier of the user performing the upload
 * @returns {Promise<Object>} summary of the import
 */
export async function processExcelUpload(fileBuffer, { updatedBy = null } = {}) {
  const rawRows = parseWorkbookToRows(fileBuffer);

  if (rawRows.length === 0) {
    throw new Error('The uploaded sheet has no data rows.');
  }

  const timestamp = new Date().toISOString();

  const normalizedRows = rawRows.map(normalizeRow);

  const { existingIdNos } =
    await participantsRepository.findExistingIdNosAndMobiles(
      normalizedRows.map((r) => r.id_no),
    );

  const validRows = [];
  const validRowNumbers = []; // Excel row number for each entry in validRows
  const rowErrors = [];
  const duplicateRows = [];
  const seenIdNos = new Map();   // id_no -> first Excel row it appeared on
  const seenMobiles = new Map();

  for (const [index, normalized] of normalizedRows.entries()) {
    const excelRowNumber = index + 2;

    // ...your commented-out validation goes here...

    const reasons = [];

    if (normalized.id_no) {
      if (existingIdNos.has(normalized.id_no)) {
        reasons.push(`id_no ${normalized.id_no} already exists`);
      } else if (seenIdNos.has(normalized.id_no)) {
        reasons.push(`id_no ${normalized.id_no} repeats row ${seenIdNos.get(normalized.id_no)} in this file`);
      }
    }

    if (normalized.mobile_no) {
      if (seenMobiles.has(normalized.mobile_no)) {
        reasons.push(`mobile_no ${normalized.mobile_no} repeats row ${seenMobiles.get(normalized.mobile_no)} in this file`);
      }
    }

    if (reasons.length > 0) {
      duplicateRows.push({ row: excelRowNumber, messages: reasons });
      continue;
    }

    if (normalized.id_no) seenIdNos.set(normalized.id_no, excelRowNumber);
    if (normalized.mobile_no) seenMobiles.set(normalized.mobile_no, excelRowNumber);

    // ...your commented-out candidate sequence code goes here (after the duplicate check)...

    validRows.push({
      ...normalized,
      updated_by: updatedBy,
      updated_at: timestamp,
    });
    validRowNumbers.push(excelRowNumber);
  }

  let insertedCount = 0;
  const insertErrors = [];

  for (let i = 0; i < validRows.length; i += INSERT_CHUNK_SIZE) {
    const chunk = validRows.slice(i, i + INSERT_CHUNK_SIZE);
    try {
      insertedCount += await participantsRepository.bulkInsertParticipants(chunk);
    } catch (err) {
      if (err.code === '23505') {
        // Another upload inserted a matching row between our check and insert.
        // Retry one by one so a single duplicate doesn't sink the whole chunk.
        for (const [j, row] of chunk.entries()) {
          try {
            insertedCount += await participantsRepository.bulkInsertParticipants([row]);
          } catch (rowErr) {
            const target = rowErr.code === '23505' ? duplicateRows : insertErrors;
            target.push(
              rowErr.code === '23505'
                ? { row: validRowNumbers[i + j], messages: ['Duplicate id_no or mobile_no (caught by database)'] }
                : { rows: String(validRowNumbers[i + j]), message: rowErr.message }
            );
          }
        }
      } else {
        insertErrors.push({
          rows: `${i + 1}-${Math.min(i + INSERT_CHUNK_SIZE, validRows.length)}`,
          message: err.message,
        });
      }
    }
  }

  return {
    totalRows: rawRows.length,
    validRowCount: validRows.length,
    insertedCount,
    duplicateRowCount: duplicateRows.length,
    duplicateRows,
    invalidRowCount: rowErrors.length,
    rowErrors,
    insertErrors,
  };
}
// export async function processExcelUpload(fileBuffer, { updatedBy = null } = {}) {
//   const rawRows = parseWorkbookToRows(fileBuffer);

//   if (rawRows.length === 0) {
//     throw new Error('The uploaded sheet has no data rows.');
//   }

// //   const batchId = crypto.randomUUID();
//   const timestamp = new Date().toISOString();

//   const validRows = [];
//   const rowErrors = [];

//  for (const [index, rawRow] of rawRows.entries()) {
//     const excelRowNumber = index + 2;

//     const normalized = normalizeRow(rawRow);
//     // const { error, value } = validateParticipantRow(normalized);

//     // if (error) {
//     //     rowErrors.push({
//     //     row: excelRowNumber,
//     //     messages: error.details.map((detail) => detail.message),
//     //     });
//     //     continue;
//     // }

//     // const { data: sequence, error: supaError } = await supabase.rpc(
//     //     "get_next_candidate_sequence"
//     // );

//     // if (supaError) {
//     //     throw new ApiError(
//     //     HTTP_STATUS.BAD_REQUEST,
//     //     "Unable to create Candidate Sequence"
//     //     );
//     // }

//     // const candidateId = await generateCandidateId(sequence);

//     validRows.push({
//         ...normalized,
//         // candidate_id: candidateId,
//         updated_by: updatedBy,
//         updated_at: timestamp,
//     });
//   }

//   let insertedCount = 0;
//   const insertErrors = [];

//   for (let i = 0; i < validRows.length; i += INSERT_CHUNK_SIZE) {
//     const chunk = validRows.slice(i, i + INSERT_CHUNK_SIZE);
//     // console.log(i)
//     try {
//       const insertedCountForChunk = await participantsRepository.bulkInsertParticipants(chunk);

//       insertedCount += insertedCountForChunk;
//     } catch (err) {
//       insertErrors.push({
//         rows: `${i + 1}-${Math.min(i + INSERT_CHUNK_SIZE, validRows.length)}`,
//         message: err.message,
//       });
//     }
//   }

//   return {
//     // batchId,
//     totalRows: rawRows.length,
//     validRowCount: validRows.length,
//     insertedCount,
//     invalidRowCount: rowErrors.length,
//     rowErrors,
//     insertErrors,
//   };
// }