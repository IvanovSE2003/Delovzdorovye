import { NextFunction, Request, Response } from "express";
import DoctorRepository from "../../../../core/domain/repositories/doctor.repository.js";
import PatientRepository from "../../../../core/domain/repositories/patient.repository.js";
import UserRepository from "../../../../core/domain/repositories/user.repository.js";
import ApiError from "../../error/ApiError.js";
import calculateAge from "../../function/calcAge.js";

export default class ProfileController {
    constructor(
        public readonly userRepository: UserRepository,
        public readonly patientRepository: PatientRepository,
        public readonly doctorRepository: DoctorRepository
    ) { }

    async getProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { linkerId } = req.body;

            const [userLinker, user] = await Promise.all([
                this.userRepository.findById(Number(linkerId)),
                this.userRepository.findById(Number(id))
            ]);

            if (!user || !userLinker) {
                return next(ApiError.badRequest('Пользователь не найден'));
            }

            const [patient, doctor] = await Promise.all([
                user.role === 'PATIENT' ? this.patientRepository.findByUserId(user.id) : null,
                user.role === 'DOCTOR' ? this.doctorRepository.findByUserId(user.id) : null
            ]);

            const baseData = {
                id: user.id,
                avatar: user.img,
                name: user.name,
                surname: user.surname,
                patronymic: user.patronymic,
                role: user.role
            };

            const age = user.dateBirth ? calculateAge(user.dateBirth) : 0;

            const profileMappings = {
                PATIENT: {
                    PATIENT: {
                        ...baseData,
                        gender: user.gender,
                        age
                    },
                    DOCTOR: {
                        ...baseData,
                        gender: user.gender,
                        experienceYears: doctor?.experienceYears,
                        license: doctor?.license,
                        specializations: doctor?.specializations
                    },
                    default: baseData
                },
                DOCTOR: {
                    PATIENT: {
                        ...baseData,
                        gender: user.gender,
                        age
                    },
                    DOCTOR: {
                        ...baseData,
                        gender: user.gender,
                        diploma: doctor?.diploma,
                        specializations: doctor?.specializations
                    },
                    default: baseData
                },
                default: {
                    PATIENT: {
                        ...baseData,
                        gender: user.gender,
                        age
                    },
                    DOCTOR: {
                        ...baseData,
                        gender: user.gender,
                        experienceYears: doctor?.experienceYears,
                        diploma: doctor?.diploma,
                        license: doctor?.license,
                        specializations: doctor?.specializations
                    },
                    default: {
                        ...baseData,
                        gender: user.gender,
                        age
                    }
                }
            };

            const roleMapping = profileMappings[userLinker.role as keyof typeof profileMappings] || profileMappings.default;
            const data = roleMapping[user.role as keyof typeof roleMapping] || roleMapping.default;

            res.status(200).json(data);
        } catch (e: any) {
            return next(ApiError.badRequest(e.message));
        }
    }
}