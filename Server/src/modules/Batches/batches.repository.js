import { supabase } from '../../config/supabase.js';
import ApiError from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../utils/constants.js';
import { buildMonthsOrFilter } from '../../utils/monthFilter.js';

class BatchRepository {
    constructor() {
        this.table = 'batches'
    }

    async create(payload) {
    const { data, error } = await supabase.from(this.table).insert(payload).select().single();
    if (error) throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Unable to create batch', [{ field: 'Batch', message: error.message }]);
    return data;
  }

  async update(id, payload) {
    const { data, error } = await supabase.from(this.table).update(payload).eq('id', id).select().single();
    if (error) throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Unable to update carpenter', [{ field: 'id', message: error.message }]);
    return data;
  }

  async deleteBatch(id) {
    const { data, error } = await supabase.from(this.table).delete().eq('id', id).select().single();
    if (error) throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Unable to delete Batch', [{ field: 'id', message: error.message }]);
    return data;
  }

  async findById(id) {
    const { data, error } = await supabase.from(this.table).select('*').eq('id', id).maybeSingle();
    if (error) throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Unable to fetch carpenter', [{ field: 'id', message: error.message }]);
    return data;
  }

  // Shared filter logic for the list query and the stats query
  applyListFilters(query, filters = {}, { search, months = [] } = {}) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) query = query.eq(key, value);
    });

    if (search) {
      query = query.or(`batch_id.ilike.%${search}%,trainer_name.ilike.%${search}%,trainer_phone_number.ilike.%${search}%,mobiliser_id.ilike.%${search}%`);
    }

    // Month filter: batches whose workshop_date falls in ANY selected month
    const monthsFilter = buildMonthsOrFilter('workshop_date', months);
    if (monthsFilter) query = query.or(monthsFilter);

    return query;
  }

  async findAll(filters = {}, options = {}) {
    const { page = 1, pageSize = 20, search, sort, months = [] } = options;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

   let query = supabase
      .from("batches_with_counts")
      .select(
        `
          *,
          mobiliser:platform_users!fk_batches_mobiliser(
            id,
            name,
            email,
            phone_no
          )
        `,
        { count: "exact" }
      ).order("workshop_date", { ascending: false })
      .range(from, to);

    query = this.applyListFilters(query, filters, { search, months });

    if (sort) {
      const [column, direction] = sort.split(',');
      query = query.order(column, { ascending: direction !== 'desc' });
    }

    const { data, error, count } = await query;
    if (error) throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Unable to fetch carpenters', [{ field: 'query', message: error.message }]);

    return { data, count: count ?? 0 };
  }

  // Totals across ALL batches matching the filters (not just the current page)
  async getStats(filters = {}, options = {}) {
    const { search, months = [] } = options;

    let query = supabase.from('batches_with_counts').select('status,total_participants');
    query = this.applyListFilters(query, filters, { search, months });

    const { data, error } = await query;
    if (error) throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Unable to fetch batch stats', [{ field: 'query', message: error.message }]);

    const rows = data ?? [];
    const isHeld = (b) => String(b.status).toUpperCase() === 'COMPLETED';
    const sumParticipants = (list) => list.reduce((sum, b) => sum + (Number(b.total_participants) || 0), 0);
    const held = rows.filter(isHeld);

    return {
      totalBatches: rows.length,
      batchesHeld: held.length,
      totalParticipants: sumParticipants(rows),
      participantsInHeldBatches: sumParticipants(held),
    };
  }

  async findByAadhaar(aadhaarNumber) {
    const { data, error } = await supabase.from(this.table).select('*').eq('id_no', aadhaarNumber).maybeSingle();
    if (error) throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Unable to fetch carpenter', [{ field: 'aadhaar_number', message: error.message }]);
    return data;
  }

  async findByMobile(mobileNumber) {
    const { data, error } = await supabase.from(this.table).select('*').eq('mobile_no', mobileNumber).maybeSingle();
    if (error) throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Unable to fetch carpenter', [{ field: 'mobile_number', message: error.message }]);
    return data;
  }
}


export default BatchRepository;