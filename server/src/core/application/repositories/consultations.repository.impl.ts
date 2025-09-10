import { IConsultaitionCreationAttributes } from "../../../infrastructure/persostence/models/interfaces/consultation.model.js";
import models from "../../../infrastructure/persostence/models/models.js";
import Consultation from "../../domain/entities/consultation.entity.js";
import ConsultationRepository from "../../domain/repositories/consultation.repository.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { Op } from "sequelize";
import Problem from "../../domain/entities/problem.entity.js";

export default class ConsultationRepositoryImpl implements ConsultationRepository {
    async findById(id: number): Promise<Consultation | null> {
        const consultation = await models.Consultation.findByPk(id);
        return consultation ? this.mapToDomainConsultation(consultation) : null;
    }

    async findAll(page: number, limit: number, filters?: {
        payment_status?: string;
        consultation_status?: string;
        userId?: number;
        doctorId?: number;
    }
    ): Promise<{
        consultations: Consultation[];
        totalCount: number;
        totalPages: number;
    }> {
        const where: any = {};

        if (filters?.payment_status !== undefined && filters?.payment_status !== null) {
            where.payment_status = filters.payment_status;
        }

        if (filters?.consultation_status !== undefined && filters?.consultation_status !== null) {
            where.consultation_status = filters.consultation_status;
        }

        if (filters?.userId !== undefined && filters?.userId !== null) {
            where.userId = filters.userId;
        }

        if (filters?.doctorId !== undefined && filters?.doctorId !== null) {
            where.doctorId = filters.doctorId;
        }

        const totalCount = await models.Consultation.count({
            where
        });

        const totalPages = Math.ceil(totalCount / limit);

        const consultations = await models.Consultation.findAll({
            where,
            include: [
                {
                    model: models.DoctorModel,
                    include: [
                        {
                            model: models.UserModel,
                            attributes: ['id', 'name', 'surname', 'patronymic']
                        },
                        {
                            model: models.DoctorSpecialization,
                            as: "profData",
                            include: [
                                {
                                    model: models.SpecializationModel,
                                    attributes: ["id", "name"]
                                }
                            ]
                        }
                    ]
                },
                {
                    model: models.UserModel,
                    attributes: ['id', 'name', 'surname', 'patronymic']
                },
                {
                    model: models.ProblemModel,
                    through: { attributes: [] },
                    attributes: ['id', 'name']
                },
            ],
            limit,
            offset: (page - 1) * limit,
            order: [['id', 'ASC']]
        });

        return {
            consultations: consultations.map(consultation => this.mapToDomainConsultation(consultation)),
            totalCount,
            totalPages
        };
    }

    async findTimeSlotForDateProblem(problems: number[], date: string): Promise<string[]> {
        const problemEntities = await models.ProblemModel.findAll({
            where: { id: problems },
            include: [{ model: models.SpecializationModel, through: { attributes: [] } }]
        });

        if (!problemEntities || problemEntities.length === 0) {
            throw new Error("Проблемы не найдены");
        }

        const specializationIds = [
            ...new Set(problemEntities.flatMap(p => p.specializations?.map(s => s.id) || []))
        ];

        if (specializationIds.length === 0) {
            throw new Error("Нет подходящих специалистов");
        }

        const doctors = await models.DoctorModel.findAll({
            include: [
                {
                    model: models.SpecializationModel,
                    where: { id: specializationIds },
                    required: true
                }
            ]
        });

        if (!doctors || doctors.length === 0) {
            throw new Error("Нет подходящих специалистов");
        }

        const doctorIds = doctors.map(doc => doc.id);

        dayjs.extend(utc);
        dayjs.extend(timezone);

        const startOfDay = dayjs(date).tz("Europe/Moscow").startOf("day").toDate();
        const endOfDay = dayjs(date).tz("Europe/Moscow").endOf("day").toDate();

        const timeSlots = await models.DoctorSlots.findAll({
            where: {
                date: { [Op.between]: [startOfDay, endOfDay] },
                doctorId: doctorIds
            },
            attributes: ["id"]
        });

        const availableSlots = [...new Set(timeSlots.map(slot => slot.time))];
        return availableSlots;
    }

    async findByUserId(id: number, page: number, limit: number): Promise<Consultation[]> {
        const consultations = await models.Consultation.findAll({
            where:
            {
                userId: id,
                consultation_status: "ARCHIVE"
            },
            include: [
                {
                    model: models.DoctorModel,
                    as: "doctor",
                    include: [
                        {
                            model: models.UserModel,
                            as: "user"
                        },
                        {
                            model: models.DoctorSpecialization,
                            as: "profData",
                            include: [
                                {
                                    model: models.SpecializationModel,
                                    attributes: ["id", "name"]
                                }
                            ]
                        }
                    ]
                },
                {
                    model: models.UserModel,
                    as: "user"
                },
                {
                    model: models.ProblemModel,
                    as: "problems",
                    through: { attributes: [] }
                }
            ],
            limit,
            offset: (page - 1) * limit,
            order: [
                ['date', 'DESC'],
                ['time', 'DESC']
            ]
        });

        return consultations.map(consult => this.mapToDomainConsultation(consult));
    }

    async create(consultationData: Consultation): Promise<Consultation> {
        const createdConsult = await models.Consultation.create(this.mapToPersistence(consultationData));
        return this.mapToDomainConsultation(createdConsult);
    }

    async update(consult: Consultation): Promise<Consultation> {
        const existingConsult = await models.Consultation.findByPk(consult.id);
        if (!existingConsult) {
            throw new Error(`Консультация с ID ${consult.id} не найдена`);
        }

        await models.Consultation.update(this.mapToPersistence(consult), {
            where: { id: consult.id }
        });

        const updatedConsult = await models.Consultation.findByPk(consult.id);
        if (!updatedConsult) {
            throw new Error('Консультация не была обновлена');
        }

        return this.mapToDomainConsultation(updatedConsult);
    }

    async save(consult: Consultation): Promise<Consultation> {
        return consult.id ? await this.update(consult) : await this.create(consult);
    }

    private mapToDomainConsultation(consultModel: any): Consultation {
        return new Consultation(
            consultModel.id,
            consultModel.consultation_status,
            consultModel.payment_status,
            consultModel.other_problem,
            consultModel.recommendations,
            consultModel.duration,
            consultModel.score,
            consultModel.comment,
            consultModel.reservation_expires_at,
            consultModel.reason_cancel,
            consultModel.time,
            consultModel.date,
            consultModel.userId,
            consultModel.doctorId,

            consultModel.doctor ? {
                id: consultModel.doctor.id,
                user: {
                    id: consultModel.doctor.user.id,
                    name: consultModel.doctor.user.name,
                    surname: consultModel.doctor.user.surname,
                    patronymic: consultModel.doctor.user.patronymic,
                    email: consultModel.doctor.user.email,
                    img: consultModel.doctor.user.img
                },
                profData: consultModel.doctor.profData
                    ? consultModel.doctor.profData.map((p: any) => ({
                        specialization: p.specialization ? p.specialization.name : null,
                        diploma: p.diploma,
                        license: p.license
                    }))
                    : []
            } : null,
            consultModel.user ? {
                id: consultModel.user.id,
                name: consultModel.user.name,
                surname: consultModel.user.surname,
                patronymic: consultModel.user.patronymic,
                email: consultModel.user.email,
                phone: consultModel.user.phone,
                date_birth: consultModel.user.date_birth,
                gender: consultModel.user.gender
            } : null,
            consultModel.problems ? consultModel.problems.map((problem: any) =>
                new Problem(problem.id, problem.name)
            ) : []
        );
    }

    private mapToPersistence(consult: Consultation): IConsultaitionCreationAttributes {
        return {
            consultation_status: consult.consultation_status,
            payment_status: consult.payment_status,
            other_problem: consult.other_problem,
            recommendations: consult.recommendations,
            duration: consult.duration,
            score: consult.score,
            comment: consult.comment,
            reservation_expires_at: consult.reservation_expires_at,
            reason_cancel: consult.reason_cancel,
            time: consult.time,
            date: consult.date,
            userId: consult.userId,
            doctorId: consult.doctorId,
        };
    }
}