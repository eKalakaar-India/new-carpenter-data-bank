import ApiError from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../utils/constants.js';
import CarpentersRepository from './carpenters.repository.js';
import { logger } from '../../utils/logger.js';

class CarpentersService {
  constructor() {
    this.repository = new CarpentersRepository();
  }

  async create(payload, user) {
    const existingAadhaar = await this.repository.findByAadhaar(payload.aadhaar_number);
    if (existingAadhaar) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Aadhaar number already exists');
    }

    const existingMobile = await this.repository.findByMobile(payload.mobile_number);
    if (existingMobile) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Mobile number already exists');
    }

    const carpenter = await this.repository.create({
      ...payload,
      created_by: user?.userId || payload.created_by || null,
      updated_by: user?.userId || payload.updated_by || null,
      created_at: payload.registration_date || new Date().toISOString(),
    });

    logger.info({ carpenterId: carpenter.id, createdBy: user?.userId }, 'Carpenter created');
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

  async delete(id) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Carpenter not found');
    }

    const carpenter = await this.repository.delete(id);
    logger.info({ carpenterId: id }, 'Carpenter deleted');
    return carpenter;
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
}

export default CarpentersService;
