import { NextFunction, Request, Response } from 'express'
import BatchRepository from "../../../../core/domain/repositories/batch.repository.js";
import ApiError from "../../error/ApiError.js";

export default class BatchController {
    constructor(
        private readonly batchRepository: BatchRepository
    ) {}

    async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const {id} = req.params;
            const batch = await this.batchRepository.findById(Number(id));

            if(!batch) {
                return next(ApiError.badRequest('Изменение не найдено'));
            }

            return res.status(200).json(batch);
        } catch(e: any) {
            return next(ApiError.badRequest(e.message));
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const limit = req.body.limit || 10;
            const page = req.body.page || 1;
            const batches = await this.batchRepository.findAll(Number(page), Number(limit));
            if(!batches) {
                return next(ApiError.badRequest('Изменения не наденый'));
            }
            return res.status(200).json(batches);
        } catch(e: any) {
            next(ApiError.badRequest(e.message));
        }
    }
}