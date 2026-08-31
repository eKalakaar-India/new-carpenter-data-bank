import { supabase } from '../../config/supabase.js';

const TABLE_NAME = 'participants';

/**
 * Inserts a batch of already-validated participant rows.
 * @param {Object[]} rows
 * @returns {Promise<Object[]>} the rows as inserted (including generated ids)
 */
// async function bulkInsertParticipants(rows) {
//   if (!rows || rows.length === 0) {
//     return 0;
//   }

//   const { error } = await supabase
//     .from(TABLE_NAME)
//     .insert(rows);

//   if (error) {
//     throw new Error(
//       `Supabase insert failed: ${error.message}`
//     );
//   }

//   // Since we are not using .select(),
//   // Supabase does not return inserted rows.
//   // We already know how many rows were inserted.
//   return rows.length;
// }


async function bulkInsertParticipants(rows) {
  try {
    if (!Array.isArray(rows)) {
      throw new Error("rows must be an array.");
    }

    if (rows.length === 0) {
      return 0;
    }

    console.log(`Attempting to insert ${rows.length} rows`);

    const { error } = await supabase
      .from(TABLE_NAME)
      .insert(rows);

    if (error) {
      console.error("========== SUPABASE INSERT ERROR ==========");
      console.error("Code:", error.code);
      console.error("Message:", error.message);
      console.error("Details:", error.details);
      console.error("Hint:", error.hint);
      console.error("============================================");

      throw new Error(
        `Supabase insert failed [${error.code}]: ${error.message}`
      );
    }

    return rows.length;
  } catch (error) {
    console.error("========== BULK INSERT FAILED ==========");
    console.error(error);
    console.error("=========================================");

    throw error;
  }
}



/**
 * Fetches every row that belongs to a given upload batch — useful for a
 * "review what was just imported" screen.
 */
async function getParticipantsByBatchId(batchId) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('batch_id', batchId);

  if (error) throw new Error(`Supabase query failed: ${error.message}`);
  return data;
}

/**
 * Paginated listing, most recent first.
 */
async function listParticipants({ page = 1, pageSize = 20 } = {}) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from(TABLE_NAME)
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw new Error(`Supabase query failed: ${error.message}`);
  return { data, count, page, pageSize };
}

/**
 * Looks up an existing participant by government ID number — handy for a
 * duplicate check before/while importing.
 */
async function findByIdNumber(idNo) {
  if (!idNo) return null;

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('id, id_no, full_name')
    .eq('id_no', idNo)
    .maybeSingle();

  if (error) throw new Error(`Supabase query failed: ${error.message}`);
  return data;
}

export default{
  bulkInsertParticipants,
  getParticipantsByBatchId,
  listParticipants,
  findByIdNumber,
};