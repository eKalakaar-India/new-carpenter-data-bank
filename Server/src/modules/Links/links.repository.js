import { supabase } from '../../config/supabase.js';
import ApiError from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../utils/constants.js';

// The Excel "id" column is the participant's system id (the `id` primary key).
// Links are stored in participants.certificate_link,
// participants.insurance_link_msawasth and participants.insurance_link_niva.
const MATCH_FIELD = 'id';
const TABLE = 'participants';

class LinksRepository {
  /**
   * Returns which of the given match-field values actually exist, so the
   * service can report "not found" rows without attempting an update for
   * each one individually.
   */
  async findExistingIds(matchValues) {
    if (!matchValues.length) return [];

    const { data, error } = await supabase.from(TABLE).select(MATCH_FIELD).in(MATCH_FIELD, matchValues);
    if (error) {
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Unable to verify carpenter records', [
        { field: MATCH_FIELD, message: error.message },
      ]);
    }
    return data.map((record) => record[MATCH_FIELD]);
  }

  async updateCertificateLink(matchValue, certificateLink) {
    const { data, error } = await supabase
      .from(TABLE)
      .update({has_certificate: true, certificate_link: certificateLink })
      .eq(MATCH_FIELD, matchValue)
      .select('id')
      .maybeSingle();

    if (error) {
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Unable to update certificate link', [
        { field: MATCH_FIELD, message: error.message },
      ]);
    }
    return data;
  }

  /**
   * @param {{insurance_link_msawasth?: string, insurance_link_niva?: string}} insuranceLinks
   *   only the links to set - omitted keys leave the stored value untouched.
   */
  async updateInsuranceLinks(matchValue, insuranceLinks) {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ has_insurance: true, ...insuranceLinks })
      .eq(MATCH_FIELD, matchValue)
      .select('id')
      .maybeSingle();

    if (error) {
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Unable to update insurance links', [
        { field: MATCH_FIELD, message: error.message },
      ]);
    }
    return data;
  }
}

export default LinksRepository;