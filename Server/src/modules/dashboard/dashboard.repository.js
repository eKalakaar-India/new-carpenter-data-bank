import { supabase } from '../../config/supabase.js';
import ApiError from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../utils/constants.js';

class DashboardRepository {
  async getCarpenters() {
    // const { data, error } = await supabase.from('participants').select('*');
    let {data, error} = await supabase.from('participants').select(`*, batch_data:batches!participants_batch_id_fkey(
        id,
        batch_id,
        workshop_date,
        full_address,
        status
      )`);

    if (error) throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Unable to fetch dashboard data', [{ field: 'carpenters', message: error.message }]);
    return data ?? [];
  }

  async getRecentRegistrations(limit = 10) {
    const { data, error } = await supabase.from('participants').select('*').order('created_at', { ascending: false }).limit(limit);
    if (error) throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Unable to fetch recent registrations', [{ field: 'recent', message: error.message }]);
    return data ?? [];
  }
}

export default DashboardRepository;
