import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS } from '../utils/constants.js';

class BaseService {
  constructor(repository) {
    this.repository = repository;
  }

  async create(payload) {
    return this.repository.create(payload);
  }

  async createMany(payloads) {
    return this.repository.createMany(payloads);
  }

  async getById(id) {
    const data = await this.repository.findById(id);
    if (!data) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, `${this.resourceName} not found`);
    }
    return data;
  }

  async getAll(filters = {}, options = {}) {
    const { page, pageSize, sort, search } = options;
    const result = await this.repository.paginate(filters, { page, pageSize, sort, search });

    return result;
  }

  async update(id, payload) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, `${this.resourceName} not found`);
    }

    return this.repository.update(id, payload);
  }

  async delete(id) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, `${this.resourceName} not found`);
    }

    return this.repository.delete(id);
  }
}

export default BaseService;
