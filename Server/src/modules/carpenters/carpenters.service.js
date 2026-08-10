import ApiError from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../utils/constants.js';
import CarpentersRepository from './carpenters.repository.js';
import { logger } from '../../utils/logger.js';
import { supabase } from '../../config/supabase.js';
import { generateCandidateId } from "../../utils/generateCandidateIds.js";
import * as GalleryService from "../gallery/gallery.service.js";


class CarpentersService {
  constructor() {
    this.repository = new CarpentersRepository();
  }

  async create(payload, file, user) {
    const existingAadhaar = await this.repository.findByAadhaar(payload.id_no);
    if (existingAadhaar) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Aadhaar number already exists');
    }

    const existingMobile = await this.repository.findByMobile(payload.mobile_no);
    if (existingMobile) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Mobile number already exists');
    }

    const { data: sequence, error } = await supabase.rpc(
      "get_next_candidate_sequence"
    );

    if (error){
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Unable to create Candidate Sequence")
    };

    const candidateId = await generateCandidateId(sequence);

    const image = await GalleryService.uploadSingleImage({
      file: file.buffer,
      imageType: file.mimetype,
      uploadedBy: payload.updated_by ,
    });

    console.log(image);

    const carpenter = await this.repository.create({
      ...payload,
      country_code:"+91",
      id_link:image.storagePath,     
      candidate_id: candidateId,
      mobiliser_id: user?.userId || payload.created_by || null,
      updated_by: user?.userId || payload.updated_by || null,
      created_at: payload.registration_date || new Date().toISOString(),
    });

    logger.info({ carpenterId: carpenter.id, mobiliserId: user?.userId }, 'Carpenter created');
    return carpenter;
  }

  async update(id, payload, user) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Carpenter not found');
    }

    const carpenter = await this.repository.update(id, {
      ...payload,
      updated_by: user?.userId || payload.updated_by || existing.updated_by,
    });

    logger.info({ carpenterId: id, updatedBy: user?.userId }, 'Carpenter updated');
    return carpenter;
  }

  async updateBatch(ids, payload, user) {
    return this.repository.updateBatch(ids, {
      batch_id: payload.batch,
      updated_by: user.userId,
    });
    logger.info({ carpenterId: id, updatedBy: user?.userId }, 'Carpenter updated'); return carpenter;
  }

  async delete(id) {
    const existing = await this.repository.findByIds(id);
    if (!existing) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Carpenter not found');
    }

    const carpenter = await this.repository.delete(id);
    logger.info({ carpenterId: id }, 'Carpenter deleted');
    return carpenter;
  }

  async deleteBulk(ids) {
    const existing = await this.repository.findByIds(ids);
    console.log(existing, ids)
    // if (existing !== ids.length) {
    //   throw new ApiError(HTTP_STATUS.NOT_FOUND, 'One or more carpenters not found');
    // }
    // return this.repository.deleteBulk(ids);
  }

  async getById(id) {
    const carpenter = await this.repository.findById(id);
    if (!carpenter) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Carpenter not found');
    }
    return carpenter;
  }

  async getAll(query = {}) {
    const page = Number(query.page ?? 1);
    const pageSize = Number(query.pageSize ?? 20);
    const filters = {};

    if (query.state) filters.state = query.state;
    if (query.district) filters.district = query.district;
    // if (query.trade) filters.trade = query.trade;
    if (query.training_status) filters.training_status = query.training_status;
    if (query.insurance_status) filters.insurance_status = query.insurance_status;

    return this.repository.findAll(filters, {
      page,
      pageSize,
      search: query.search,
      sort: query.sort,
    });
  }

  async getAllCarpenterMobilizerRecords(query = {}) {
    const page = Number(query.page ?? 1);
    const pageSize = Number(query.pageSize ?? 20);
    const filters = {};

    if (query.state) filters.state = query.state;
    if (query.district) filters.district = query.district;
    // if (query.trade) filters.trade = query.trade;
    if (query.training_status) filters.training_status = query.training_status;
    if (query.insurance_status) filters.insurance_status = query.insurance_status;

    return this.repository.findAllCarpentersMobilizerRecords(filters, {
      page,
      pageSize,
      search: query.search,
      sort: query.sort,
    });
  }

  async getAllMobilizerRecords(query = {}) {
    const page = Number(query.page ?? 1);
    const pageSize = Number(query.pageSize ?? 20);
    const filters = {};

    if (query.state) filters.state = query.state;
    if (query.district) filters.district = query.district;
    // if (query.trade) filters.trade = query.trade;
    if (query.training_status) filters.training_status = query.training_status;
    if (query.insurance_status) filters.insurance_status = query.insurance_status;

    return this.repository.findAllMobilizerRecords(filters, {
      page,
      pageSize,
      search: query.search,
      sort: query.sort,
    });
  }
}

export default CarpentersService;
