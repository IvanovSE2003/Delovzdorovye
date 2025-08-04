import { Request, Response, NextFunction} from "express";
import ApiError from "../error/ApiError.js";
import models from "../models/models.js"; 

const {Patient} = models;

class PatientController {
    static async getAll(req: Request, res: Response) {
        const limit = parseInt(req.query.limit as string) || 10;
        const page = parseInt(req.query.page as string) || 1;
        const offset = (page - 1) * limit;

        const patients = await Patient.findAndCountAll({limit, offset});
        return res.status(200).json(patients)
    }

    static async getPatientByUser(req: Request, res: Response, next: NextFunction) {
        const {userId} = req.params;
        const patient = await Patient.findOne({where: {userId}})
        if(!patient) {
            return next(ApiError.badRequest('Пользователь не является пациентом'))
        }
        return res.status(200).json(patient)
    }

    static async getOne(req: Request, res: Response, next: NextFunction) {
        const {id} = req.params;
        const patient = await Patient.findOne({where: {id}});
        if(!patient) {
            return next(ApiError.badRequest('Пациента с таким id не существует'))
        }
        return res.status(200).json(patient)
    }

    static async updatePatient(req: Request, res: Response, next: NextFunction) {
        const { userId } = req.params;
        const {general_info, analyses_examinations, additionally} = req.body;

        if (!general_info && !analyses_examinations && !additionally) {
            return next(ApiError.badRequest('Нет данных для обновления'));
        }

        try {
            const patient = await Patient.update({general_info, analyses_examinations, additionally}, { where: { userId } });
            return res.status(200).json(patient);
        } catch (error) {
            return next(ApiError.internal('Ошибка при обновлении данных пациента'));
        }
    }
}

export default PatientController;