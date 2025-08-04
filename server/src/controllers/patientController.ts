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
            return next(ApiError.badRequest('Пациентас таким id не существует'))
        }
        return res.status(200).json(patient)
    }

    static async create(req: Request, res: Response) {
        const {general_info, analyses_examinations, additionally, userId} = req.body;
        const newPatient = await Patient.create({general_info, analyses_examinations, additionally, userId})
        return res.json(newPatient)
    }
}

export default PatientController;