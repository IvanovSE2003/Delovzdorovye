import { Request, Response, NextFunction } from "express";
import ProblemRepository from "../../../../core/domain/repositories/problem.repository.js";
import ApiError from "../../error/ApiError.js";
import ConsultationRepository from "../../../../core/domain/repositories/consultation.repository.js";
import models from "../../../persostence/models/models.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { Op } from "sequelize";

export default class ConsultationController {
    constructor(
        private readonly problemRepository: ProblemRepository,
        private readonly consultationRepository: ConsultationRepository
    ) { }

    async findProblmesAll(req: Request, res: Response, next: NextFunction) {
        try {
            const problems = await this.problemRepository.findAll();
            if (!problems) {
                return next(ApiError.badRequest('Проблемы не найдены'));
            }

            return res.status(200).json(problems);
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async findDateForProblem(req: Request, res: Response, next: NextFunction) {
        try {
            const { problems } = req.body as { problems: number[] };

            const problemEntities = await models.ProblemModel.findAll({
                where: { id: problems },
                include: [
                    {
                        model: models.SpecializationModel,
                        through: { attributes: [] }
                    }
                ]
            });

            if (!problemEntities || problemEntities.length === 0) {
                return next(ApiError.badRequest("Проблемы не найдены"));
            }

            const specializationIds = [
                ...new Set(problemEntities.flatMap(p => p.specializations?.map((s: { id: any; }) => s.id) || []))
            ];

            console.log(specializationIds)

            if (specializationIds.length === 0) {
                return next(ApiError.badRequest("Нет подходящих специалистов"));
            }

            const doctors = await models.DoctorModel.findAll({
                include: [
                    {
                        model: models.SpecializationModel,
                        where: { id: specializationIds }
                    },
                    {
                        model: models.DoctorsSchedule
                    }
                ]
            });

            const availableDates = [...new Set(
                doctors.flatMap(doc => doc.doctors_schedules?.map(s => s.date) || [])
            )];

            return res.json(availableDates);

        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async findTimeSlotForDateProblem(req: Request, res: Response, next: NextFunction) {
        try {
            const { problems, date } = req.body as { problems: number[], date: string };

            const problemEntities = await models.ProblemModel.findAll({
                where: { id: problems },
                include: [{ model: models.SpecializationModel, through: { attributes: [] } }]
            });

            if (!problemEntities || problemEntities.length === 0) {
                return next(ApiError.badRequest("Проблемы не найдены"));
            }

            const specializationIds = [
                ...new Set(problemEntities.flatMap(p => p.specializations?.map(s => s.id) || []))
            ];

            if (specializationIds.length === 0) {
                return next(ApiError.badRequest("Нет подходящих специалистов"));
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
                return next(ApiError.badRequest("Нет подходящих специалистов"));
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
            console.log(scheduleIds)

            if (scheduleIds.length === 0) {
                return next(ApiError.badRequest("Нет доступных слотов у подходящих врачей в эту дату"));
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

            if (availableSlots.length === 0) {
                return next(ApiError.badRequest("Нет доступных слотов у подходящих врачей в эту дату"));
            }

            return res.json({ slots: availableSlots });
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }
}
