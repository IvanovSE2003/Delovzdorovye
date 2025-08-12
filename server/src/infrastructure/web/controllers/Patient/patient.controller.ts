import { NextFunction, Request, Response} from "express";
import PatientRepository from "../../../../core/domain/repositories/patient.repository.js";
import ApiError from "../../error/ApiError.js";

export default class PatientController {
    constructor(
        private readonly patientRepository: PatientRepository
    ) {}

    async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const {id} = req.params;
            const patient = await this.patientRepository.findByUserId(Number(id));
            if(!patient) {
                return next(ApiError.badRequest('Пользователь не является пациентом'));
            }
            return res.status(200).json(patient)
        } catch(e: any) {
            return next(ApiError.badRequest(e.message));
        }        
    }

    async getAllPatient(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            
            const filters = {
                bloodType: req.query.bloodType as string | undefined,
                isActive: req.query.isActive !== undefined 
                    ? req.query.isActive === 'true' 
                    : undefined,
                gender: req.query.gender as string | undefined
            };
            
            const result = await this.patientRepository.findAll(page, limit, filters);
            
            res.status(200).json({
                success: true,
                data: result.patients,
                pagination: {
                    currentPage: page,
                    totalPages: result.totalPages,
                    totalItems: result.totalCount,
                    itemsPerPage: limit
                }
            });
        } catch (error) {
            next(ApiError.internal('Ошибка при получении списка пациентов'));
        }
    }

    async updatePatient(req: Request, res: Response, next: NextFunction) {
        try {
            const {id} = req.params;
            const {generalInfo, analysesExaminations, additionally} = req.body;

            const patient = await this.patientRepository.findById(Number(id));

            if(!patient) {
                return next(ApiError.badRequest('Пациент не найден'));
            }

            const updatePatient = await this.patientRepository.update(patient.updateInfo(generalInfo, analysesExaminations, additionally));
            if(updatePatient) {
                return res.status(200).json({success: true, message: 'Картачка пациент успешно обновлена'});
            } else {
                return res.status(501).json({success: false, message: 'Не удалось обновить карточку пациента'});
            }
        } catch(e: any) {
            return next(ApiError.badRequest('Ошибка при обновлении данных о пациенте'));
        }
    }
}