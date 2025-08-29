import { ConsultationModelInterface, IConsultaitionCreationAttributes } from "../../../infrastructure/persostence/models/interfaces/consultation.model.js";
import models from "../../../infrastructure/persostence/models/models.js";
import Consultation from "../../domain/entities/consultation.entity.js";
import ConsultationRepository from "../../domain/repositories/consultation.repository.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { Op } from "sequelize";

export default class ConsultationRepositoryImpl implements ConsultationRepository {
    async findById(id: number): Promise<Consultation | null> {
        const consultation = await models.Consultation.findByPk(id);
        return consultation ? this.mapToDomainConsultation(consultation) : null;
    }

    async findAll(page: number, limit: number, filters?: {
        payment_status?: string;
        consultation_status?: string;
        userId?: number;
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

        const totalCount = await models.Consultation.count({
            where
        });

        const totalPages = Math.ceil(totalCount / limit);

        const consultations = await models.Consultation.findAll({
            where,
            include: [

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

        const schedules = await models.DoctorsSchedule.findAll({
            where: {
                date: { [Op.between]: [startOfDay, endOfDay] },
                doctorId: doctorIds
            },
            attributes: ["id"]
        });


        const scheduleIds = schedules.map(s => s.id);

        if (scheduleIds.length === 0) {
            throw new Error("Нет доступных слотов у подходящих врачей в эту дату");
        }

        const timeSlots = await models.TimeSlot.findAll({
            where: {
                doctorsScheduleId: scheduleIds,
                isAvailable: true
            },
            order: [["time", "ASC"]],
            attributes: ["time"]
        });

        const availableSlots = [...new Set(timeSlots.map(slot => slot.time))];
        return availableSlots;
    }

    async create(consultationData: Consultation): Promise<Consultation> {
        const createdConsult = await models.Consultation.create(this.mapToPersistence(consultationData));
        return this.mapToDomainConsultation(createdConsult);
    }

    async update(id: number, consultationData: Partial<Consultation>): Promise<Consultation> {
        throw "";
    }

    private mapToDomainConsultation(consultModel: ConsultationModelInterface) {
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
            consultModel.userId,
            consultModel.doctorId,
            consultModel.timeSlotId
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
            userId: consult.userId,
            doctorId: consult.doctorId,
            timeSlotId: consult.timeSlotId
        };
    }
}