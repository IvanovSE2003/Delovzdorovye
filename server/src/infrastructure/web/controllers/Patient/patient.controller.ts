import { NextFunction, Request, Response} from "express";
import PatientRepository from "../../../../core/domain/repositories/patient.repository.js";
import ApiError from "../../error/ApiError.js";

export default class PatientController {
    constructor(
        private readonly patientRepository: PatientRepository
    ) {}

    async getOne(req: Request, res: Response, next: NextFunction) {
        const {id} = req.params;
        const patient = await this.patientRepository.findById(Number(id));
        if(!patient) {
            return next(ApiError.badRequest('Пользователь не является пациентом'));
        }
        return res.status(200).json({patient})
    }
}