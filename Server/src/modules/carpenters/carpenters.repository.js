import { supabase } from '../../config/supabase.js';
import ApiError from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../utils/constants.js';

class CarpentersRepository {
  constructor() {
    this.table = 'participants';
  }

  async create(payload) {
    // console.log(payload);
    payload.date_of_birth = new Date(payload.date_of_birth).toISOString();
    const { data, error } = await supabase.from(this.table).insert(payload).select().single();
    if (error) throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Unable to create carpenter', [{ field: 'carpenter', message: error.message }]);
    return data;
  }

  async update(id, payload) {
    const { data, error } = await supabase.from(this.table).update(payload).eq('id', id).select().single();
    if (error) throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Unable to update carpenter', [{ field: 'id', message: error.message }]);
    return data;
  }

  async delete(id) {
    const { data, error } = await supabase.from(this.table).delete().eq('id', id).select().single();
    if (error) throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Unable to delete carpenter', [{ field: 'id', message: error.message }]);
    return data;
  }
  
  async findByIds(ids) {
    const { data, error } = await supabase.from(this.table).select('*').in('id', ids);
    if (error) throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Unable to fetch carpenters', [{ field: 'ids', message: error.message }]);
    return data;
  }

  async deleteBulk(ids) {
    const { data, error } = await supabase.from(this.table).delete().in('id', ids).select();
    if (error) throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Unable to delete carpenters', [{ field: 'ids', message: error.message }]);
    return data;
  }

  async findById(id) {
    const { data, error } = await supabase.from(this.table).select('*').eq('id', id).maybeSingle();
    if (error) throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Unable to fetch carpenter', [{ field: 'id', message: error.message }]);
    return data;
  }

  async updateBatch(ids, payload) {
    const { data, error } = await supabase.from(this.table).update({ batch_id:payload.batch_id, updated_by: payload.updated_by }).in('id', ids).select();
//     const { data: matched, error: matchError } = await supabase
//       .from(this.table)
//       .select("id, batch_id")
//       .in("id", ids);

//     console.log("Matched:", matched);
//     console.log("Match error:", matchError);

//         console.log(ids);
//     console.log(Array.isArray(ids));
//     console.log(typeof ids[0]);
//     const { data, error } = await supabase
//       .from(this.table)
//       .update({
//         batch_id: payload.batch_id,
//       })
//       .in("id", ids)
//       .select();

// console.log({ data, error });
    if (error) throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Unable to update carpenters in batch', [{ field: 'ids', message: error.message }]);
    return data;
  }

  async findAllMobilizerRecords(filters = {}, options = {}) {
    const { page = 1, pageSize = 20, search, sort } = options;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from(this.table).select(`*,batch_data:batches!participants_batch_id_fkey(
        id,
        batch_id,
        status
      )`, { count: 'exact' }).range(from, to);

    Object.entries(filters).forEach(([key, value]) => {
      if (value) query = query.eq(key, value);
    });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,mobile_no.ilike.%${search}%,id_no.ilike.%${search}%`);
    }

    if (sort) {
      const [column, direction] = sort.split(',');
      query = query.order(column, { ascending: direction !== 'desc' });
    }

    const { data, error, count } = await query;
    if (error) throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Unable to fetch carpenters', [{ field: 'query', message: error.message }]);

    return { data, count: count ?? 0 };
  }


  async findAll(filters = {}, options = {}) {
    const { page = 1, pageSize = 20, search, sort } = options;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from(this.table).select(`*,batch_data:batches!participants_batch_id_fkey(
        id,
        batch_id,
        workshop_date,
        full_address,
        status
      )`, { count: 'exact' }).range(from, to);

    Object.entries(filters).forEach(([key, value]) => {
      if (value) query = query.eq(key, value);
    });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,mobile_no.ilike.%${search}%,id_no.ilike.%${search}%`);
    }

    if (sort) {
      const [column, direction] = sort.split(',');
      query = query.order(column, { ascending: direction !== 'desc' });
    }

    const { data, error, count } = await query;
    if (error) throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Unable to fetch carpenters', [{ field: 'query', message: error.message }]);

    return { data, count: count ?? 0 };
  }

  async findAllCarpentersMobilizerRecords(filters = {}, options = {}) {
    const { page = 1, pageSize = 20, search, sort } = options;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from(this.table).select(`*,batch_data:batches!participants_batch_id_fkey(
        id,
        batch_id,
        status
      )`, { count: 'exact' }).range(from, to);

    Object.entries(filters).forEach(([key, value]) => {
      if (value) query = query.eq(key, value);
    });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,mobile_no.ilike.%${search}%,id_no.ilike.%${search}%`);
    }

    if (sort) {
      const [column, direction] = sort.split(',');
      query = query.order(column, { ascending: direction !== 'desc' });
    }

    const { data, error, count } = await query;
    if (error) throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Unable to fetch carpenters', [{ field: 'query', message: error.message }]);

    return { data, count: count ?? 0 };
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

export default CarpentersRepository;
