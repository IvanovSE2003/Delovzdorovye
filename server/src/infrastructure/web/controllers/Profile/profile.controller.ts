import { NextFunction, Request, Response } from "express";
import DoctorRepository from "../../../../core/domain/repositories/doctor.repository.js";
import UserRepository from "../../../../core/domain/repositories/user.repository.js";
import ApiError from "../../error/ApiError.js";
import calculateAge from "../../function/calcAge.js";

export default class ProfileController {
    constructor(
        public readonly userRepository: UserRepository,
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

            const doctor = await this.doctorRepository.findByUserId(user.id);

            const baseData = {
                id: user.id,
                img: user.img,
                name: user.name,
                surname: user.surname,
                patronymic: user.patronymic,
                role: user.role,
                isAnonymous: user.isAnonymous
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
                        specializations: doctor?.specialization
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
                        specializations: doctor?.specialization
                    },
                    default: baseData
                },
                default: {
                    PATIENT: {
                        ...baseData,
                        gender: user.gender,
                        dateBirth: user.dateBirth,
                        phone: user.phone,
                        email: user.email,
                        age,
                    },
                    DOCTOR: {
                        ...baseData,
                        gender: user.gender,
                        experienceYears: doctor?.experienceYears,
                        diploma: doctor?.diploma,
                        license: doctor?.license,
                        specializations: doctor?.specialization
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

            return res.status(200).json(data);
        } catch (e: any) {
            return next(ApiError.badRequest(e.message));
        }
    }
}