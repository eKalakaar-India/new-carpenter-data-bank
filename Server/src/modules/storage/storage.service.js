import { supabase } from '../../config/supabase.js';

export class StorageService {
  async getSignedUrl(filePath) {
    if (!filePath) {
      return null;
    }

    if (typeof filePath === 'string' && /^https?:\/\//i.test(filePath)) {
      return filePath;
    }

    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET || 'carpenters')
      .createSignedUrl(filePath, 10 * 60);

    if (error) {
      throw error;
    }

    return data?.signedUrl || null;
  }
}
