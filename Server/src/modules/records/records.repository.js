import BaseRepository from '../../repositories/BaseRepository.js';
import { supabase } from '../../config/supabase.js';

class RecordsRepository extends BaseRepository {
  constructor() {
    super(supabase, 'participants', { searchField: 'name' });
  }
}

export default RecordsRepository;
