import { supabase } from '../../config/supabase.js';
import ApiError from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../utils/constants.js';

// ASSUMPTION - confirm both of these against your real schema:
//  1) The Excel "id" column is matched against candidate_id (the
//     human-facing ID from generateCandidateId, e.g. "CARP0001") rather
//     than the internal `id` primary key or `id_no` (Aadhaar). Change
//     MATCH_FIELD if a different column is the right join key.
//  2) `participants` has a `certificate_link` (text) column and an
//     `insurance_links` (jsonb) column. If they don't exist yet:
//       ALTER TABLE participants ADD COLUMN certificate_link text;
//       ALTER TABLE participants ADD COLUMN insurance_links jsonb;
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

  async updateInsuranceLinks(matchValue, insuranceLinks) {
    const { data, error } = await supabase
      .from(TABLE)
      .update({has_insurance: true, insurance_links: {MSwasth: insuranceLinks['M-Swasth'], niva:insuranceLinks['Niva']} })
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