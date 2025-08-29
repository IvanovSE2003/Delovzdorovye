import { Request, Response, NextFunction } from "express";
import ProblemRepository from "../../../../core/domain/repositories/problem.repository.js";
import ApiError from "../../error/ApiError.js";
import ConsultationRepository from "../../../../core/domain/repositories/consultation.repository.js";
import models from "../../../persostence/models/models.js";
import Consultation from "../../../../core/domain/entities/consultation.entity.js";
import UserRepository from "../../../../core/domain/repositories/user.repository.js";
import DoctorRepository from "../../../../core/domain/repositories/doctor.repository.js";
import TimeSlotRepository from "../../../../core/domain/repositories/timeSlot.repository.js";
import TimerService from "../../../../core/domain/services/timer.service.js";

export default class ConsultationController {
    constructor(
        private readonly problemRepository: ProblemRepository,
        private readonly consultationRepository: ConsultationRepository,
        private readonly userRepository: UserRepository,
        private readonly doctorReposiotry: DoctorRepository,
        private readonly timeSlotRepository: TimeSlotRepository,
        private readonly timerService: TimerService
    ) { }

    async findProblmesAll(req: Request, res: Response, next: NextFunction) {
        try {
            const problems = await this.problemRepository.findAll();
            if (!problems || problems.length === 0) {
                return next(ApiError.badRequest('Проблемы не найдены'));
            }

            const formattedProblems = problems.map(problem => ({
                value: problem.id,
                label: problem.name
            }));

            return res.status(200).json(formattedProblems);
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async findAllConsultation(req: Request, res: Response, next: NextFunction) {
        try {
            const { page, limit, filters } = req.body;
            const consultations = await this.consultationRepository.findAll(page, limit, filters);
            if (!consultations) {
                return next(ApiError.badRequest('Консультации не найдены'));
            }
            return res.status(200).json(consultations);
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

            const availableSlots = await this.consultationRepository.findTimeSlotForDateProblem(problems, date);

            if (availableSlots.length === 0) {
                return next(ApiError.badRequest("Нет доступных слотов у подходящих врачей в эту дату"));
            }

            return res.json({ slots: availableSlots });
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async appointment(req: Request, res: Response, next: NextFunction) {
        try {
            const { date, time, problems, userId } = req.body;

            const user = await this.userRepository.findById(Number(userId));
            if (!user) {
                return next(ApiError.badRequest('Пользователь не нейден'));
            }

            const doctor = await this.doctorReposiotry.findByDateTimeForProblems(date, time, problems);

            if (!doctor) {
                return next(ApiError.badRequest('Нет доступных врачей на указанные дату и время'));
            }

            const timeSlot = await this.timeSlotRepository.findByTimeDate(time, doctor.id, date);

            if (!timeSlot) {
                return next(ApiError.badRequest('Временная ячейка не найдена'));
            }

            const reservationExpiresAt = new Date();
            reservationExpiresAt.setMinutes(reservationExpiresAt.getMinutes() + 30);

            const consultation = await this.consultationRepository.create(new Consultation(0, "pending", "pending", null, null, 30, null, null, reservationExpiresAt, user.id, doctor.id, timeSlot.id));

            await this.timeSlotRepository.save(timeSlot.setAvailable(false));
            this.timerService.startTimer(consultation.id, reservationExpiresAt);
            return res.status(200).json(consultation);
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async getTimeLeft(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            console.log(id)

            if (!id || isNaN(Number(id))) {
                return next(ApiError.badRequest('Неверный ID консультации'));
            }

            const consultation = await this.consultationRepository.findById(Number(id));
            console.log(consultation)

            if (!consultation) {
                return next(ApiError.badRequest('Консультация не найдена'));
            }

            if (!consultation.reservation_expires_at) {
                return next(ApiError.badRequest('Время истечения не установлено'));
            }

            const timeLeft = consultation.reservation_expires_at.getTime() - Date.now();
            const isExpired = timeLeft <= 0;

            return res.status(200).json({
                success: true,
                data: {
                    consultationId: consultation.id,
                    timeLeft: Math.max(0, timeLeft),
                    formattedTime: this.formatTime(timeLeft),
                    expiresAt: consultation.reservation_expires_at,
                    isExpired,
                    paymentStatus: consultation.payment_status,
                    consultationStatus: consultation.consultation_status
                }
            });
        } catch (e: any) {
            console.error('Error in getTimeLeft:', e);
            return next(ApiError.internal('Ошибка при получении времени'));
        }
    }

    private formatTime(ms: number): string {
        if (ms <= 0) return '00:00';
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    async findSpecialistAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { page, limit, filters } = req.body;
            const result = await this.doctorReposiotry.findAll(page, limit, filters);

            const formattedDoctors = result.doctors.map(doctor => ({
                value: doctor.id,
                label: `${doctor.userSurname} ${doctor.userName} ${doctor.userPatronymic}`.trim()
            }));

            return res.status(200).json(formattedDoctors);
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }
}
