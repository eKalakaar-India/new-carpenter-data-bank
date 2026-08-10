import ApiError from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../utils/constants.js';
import BatchesRepository from './batches.repository.js';
import { logger } from '../../utils/logger.js';
import { supabase } from '../../config/supabase.js';
import { generateBatchId } from '../../utils/generateBatchId.js';
import * as GalleryService from '../gallery/gallery.service.js'


class BatchService{
    constructor(){
        this.repository = new BatchesRepository();
    }

    async create(payload, user) {
        console.log(payload);
        const batchID = generateBatchId(payload.state, payload.workshop_date, payload.district);

        const batch = await this.repository.create({
            ...payload,
            batch_id: batchID || "BAT-MAHPL",
            created_by: user?.userId || payload.created_by || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });

        logger.info({ created_by: user?.userId, mobiliserId: payload.mobiliser_id, }, 'Batch created');
        return batch;
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

    async updateCompleteStatus(images, video, id, payload, user) {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Batch not found');
        }

        const batchUpdatePayload = {
            ...payload,
            updated_by: user?.userId || payload.updated_by || existing.updated_by,
        };

        if (Array.isArray(images) && images.length > 0) {
            const imagesUpload = await GalleryService.uploadMultipleImages({
                files: images,
                uploadedBy: user?.userId || user?.id,
            });
            batchUpdatePayload.batch_img = imagesUpload.map((img) => img.publicUrl || img.storagePath);
        }

        if (video) {
            const videosUpload = await GalleryService.uploadSingleVideo(video);
            batchUpdatePayload.batch_video = videosUpload.publicUrl || videosUpload.filePath;
        }

        const carpenter = await this.repository.update(id, batchUpdatePayload);

        logger.info({ batchId: id, updatedBy: user?.userId }, 'Batch updated');
        return carpenter;
    }

    async deleteBatch(id) {
        const existing = await this.repository.findById(id);
        if (!existing) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Batch not found');
        }

        const carpenter = await this.repository.deleteBatch(id);
        logger.info({ batchId: id }, 'Batch deleted');
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

export default BatchService;