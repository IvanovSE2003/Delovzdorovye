import { Request, Response, NextFunction } from "express";
import ProblemRepository from "../../../../core/domain/repositories/problem.repository.js";
import ApiError from "../../error/ApiError.js";
import ConsultationRepository from "../../../../core/domain/repositories/consultation.repository.js";
import models from "../../../persostence/models/models.js";
import Consultation from "../../../../core/domain/entities/consultation.entity.js";
import UserRepository from "../../../../core/domain/repositories/user.repository.js";
import DoctorRepository from "../../../../core/domain/repositories/doctor.repository.js";
import TimeSlotRepository from "../../../../core/domain/repositories/timeSlot.repository.js";
import Problem from "../../../../core/domain/entities/problem.entity.js";
import { UploadedFile } from 'express-fileupload';
import FileService from "../../../../core/domain/services/file.service.js";

export default class ConsultationController {
    constructor(
        private readonly problemRepository: ProblemRepository,
        private readonly consultationRepository: ConsultationRepository,
        private readonly userRepository: UserRepository,
        private readonly doctorReposiotry: DoctorRepository,
        private readonly timeSlotRepository: TimeSlotRepository,
        private readonly fileService: FileService
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

    async updateProblem(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { name } = req.body;
            const problem = await this.problemRepository.findById(Number(id));
            if (!problem) {
                return next(ApiError.badRequest('Проблема не найдена'));
            }
            const newProblem = await this.problemRepository.save(problem.setName(name));

            return res.status(200).json(newProblem);
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async deleteProblem(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const problem = await this.problemRepository.findById(Number(id));
            if (!problem) {
                return next(ApiError.badRequest('Проблема не найдена'));
            }

            await this.problemRepository.delete(problem.id);

            return res.status(204).send();
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async createProblem(req: Request, res: Response, next: NextFunction) {
        try {
            const { name } = req.body;
            const newProblem = new Problem(0, name);
            const problemCreated = await this.problemRepository.save(newProblem);
            if (!problemCreated) {
                return next(ApiError.internal('Ошибка создания проблемы'));
            }
            res.status(200).json(problemCreated);
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async findAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { page, limit, filters } = req.body;
            const consultations = await this.consultationRepository.findAll(page, limit, filters);

            if (!consultations || consultations.consultations.length === 0) {
                return next(ApiError.badRequest('Консультации не найдены'));
            }

            const formatTimeRange = (startTime: string, duration: number): string => {
                if (!startTime || !duration) return 'Не указано';

                try {
                    const [hours, minutes] = startTime.split(':').map(Number);

                    // Вычисляем время окончания
                    const totalMinutes = hours * 60 + minutes + duration;
                    const endHours = Math.floor(totalMinutes / 60) % 24;
                    const endMinutes = totalMinutes % 60;

                    // Форматируем с ведущими нулями
                    const formattedStart = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                    const formattedEnd = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

                    return `${formattedStart} - ${formattedEnd}`;
                } catch {
                    return 'Неверный формат';
                }
            };

            const formattedConsultations = consultations.consultations.map(consultation => {
                const result: any = {
                    id: consultation.id,
                    other_problem: consultation.other_problem,
                    recommendations: consultation.recommendations,
                    durationTime: formatTimeRange(consultation.time || '', consultation.duration || 0),
                    date: consultation.date,
                    score: consultation.score,
                    comment: consultation.comment,
                    reason_cancel: consultation.reason_cancel,
                };

                if (consultation.doctor) {
                    result.DoctorId = consultation.doctor.id;
                    result.DoctorName = consultation.doctor.user.name;
                    result.DoctorSurname = consultation.doctor.user.surname;
                    result.DoctorPatronymic = consultation.doctor.user.patronymic;
                }

                if (consultation.user) {
                    result.PatientName = consultation.user.name;
                    result.PatientSurname = consultation.user.surname;
                    result.PatientPatronymic = consultation.user.patronymic;
                    result.PatientPhone = consultation.user.phone;
                }

                if (consultation.problems) {
                    result.Problems = consultation.problems.map((p: any) => p.name);
                }

                return result;
            });

            return res.status(200).json({
                consultations: formattedConsultations,
                totalCount: consultations.totalCount,
                totalPages: consultations.totalPages
            });

        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async appointment(req: Request, res: Response, next: NextFunction) {
        try {
            const { date, time, problems, doctorId, userId, otherProblemText} = req.body;

            const user = await this.userRepository.findById(Number(userId));
            if (!user) {
                return next(ApiError.badRequest('Пользователь не нейден'));
            }

            const doctor = await this.doctorReposiotry.findById(Number(doctorId));

            if (!doctor) {
                return next(ApiError.badRequest('Специалист не найден'));
            }

            const timeSlot = await this.timeSlotRepository.findByTimeDate(time, doctor.id, date, true);

            if (!timeSlot) {
                return next(ApiError.badRequest('Временная ячейка не найдена'));
            }

            const reservationExpiresAt = new Date();
            reservationExpiresAt.setMinutes(reservationExpiresAt.getMinutes() + 30);

            const consultation = await this.consultationRepository.create(new Consultation(0, "UPCOMING", "PAYMENT", otherProblemText, null, 60, null, null, reservationExpiresAt, null, time, date, user.id, doctor.id));
            await this.addProblemsToConsultation(consultation.id, problems);

            await this.timeSlotRepository.save(timeSlot.setAvailable(false));
            // this.timerService.startTimer(consultation.id, reservationExpiresAt);
            return res.status(200).json(consultation);
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async getTimeLeft(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

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
                label: `${doctor.user?.name} ${doctor.user?.surname} ${doctor.user?.patronymic}`.trim()
            }));

            return res.status(200).json(formattedDoctors);
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async resheduleConsultation(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { date, time, userId, doctorId } = req.body;

            const user = await this.userRepository.findById(Number(userId));

            if (!user) {
                return next(ApiError.badRequest('Пользователь не найден'));
            }

            const consultation = await this.consultationRepository.findById(Number(id));

            if (!consultation) {
                return next(ApiError.badRequest('Консультация не найдена'));
            }

            const timeSlot = await this.timeSlotRepository.findByTimeDate(time, doctorId, date, true);

            if (!timeSlot) {
                return next(ApiError.badRequest('Не свободной ячейки для записи на консультацию'));
            }

            console.log(consultation.time, consultation.doctorId, consultation.date);
            const timeSlotPrev = await this.timeSlotRepository.findByTimeDate(consultation.time, consultation.doctorId, consultation.date, false);

            if (!timeSlotPrev) {
                return next(ApiError.badRequest('Не найден предыдущий верменной слот'));
            }

            await this.timeSlotRepository.save(timeSlot.setAvailable(false));
            await this.timeSlotRepository.save(timeSlotPrev.setAvailable(true));

            const newConsult = await this.consultationRepository.save(consultation.setTimeDate(timeSlot.time, date));

            return res.status(200).json({ success: true, message: `Ваша консультация перенесена на ${newConsult.date} на ${time}` });
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async cancelConsultation(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { reason } = req.body;

            const consultation = await this.consultationRepository.findById(Number(id));

            if (!consultation) {
                return next(ApiError.badRequest('Консультация не найдена'));
            }

            let updateConsult: Consultation;
            if (reason) {
                updateConsult = await this.consultationRepository.save(consultation.setReason(reason).setConsultStatus("ARCHIVE"));
            } else {
                updateConsult = await this.consultationRepository.save(consultation.setConsultStatus("ARCHIVE"));
            }
            return res.status(200).json({ success: true, message: "Консультация была отменена" });
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async repeatConsultation(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { date, time } = req.body;

            const consultation = await this.consultationRepository.findById(Number(id));

            if (!consultation) {
                return next(ApiError.badRequest('Консультация не найдена'));
            }

            const user = await this.userRepository.findByDoctorId(consultation.doctorId);

            const timeSlot = await this.timeSlotRepository.findByTimeDate(time, consultation.doctorId || 0, date, true);
            if (!timeSlot) {
                return next(ApiError.badRequest('Временная ячейка занята или найдена'));
            }

            if (consultation.consultation_status === "UPCOMING") {
                return next(ApiError.badRequest('Консультация еще не закончилась'));
            }

            const reservationExpiresAt = new Date();
            reservationExpiresAt.setMinutes(reservationExpiresAt.getMinutes() + 30);

            const newConsultation = await this.consultationRepository.create(
                new Consultation(0, "UPCOMING", "PAYMENT", null, null, 30, null, null, reservationExpiresAt, null, timeSlot.time, date, consultation.userId, consultation.doctorId)
            );

            res.status(200).json({ success: true, message: `Вы повторили консультацию у специалиста ${user?.name} ${user?.name} ${user?.name} в ${newConsultation.date} на ${consultation.time}` });
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async findSpecialistForProblem(req: Request, res: Response, next: NextFunction) {
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

            if (specializationIds.length === 0) {
                return next(ApiError.badRequest("Нет подходящих специалистов"));
            }

            const doctors = await models.DoctorModel.findAll({
                where: {
                    isActivated: true,
                },
                include: [
                    {
                        model: models.UserModel,
                        attributes: ['id', 'name', 'surname', 'patronymic']
                    },
                    {
                        model: models.SpecializationModel,
                        where: {
                            id: specializationIds
                        },
                        through: { attributes: [] },
                        required: true
                    }
                ],
                attributes: ['id', 'experience_years']
            });

            res.status(200).json(doctors);
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async sendRatingComment(req: Request, res: Response, next: NextFunction) {
        try {
            const { id, rating, comment } = req.body;
            const consultation = await this.consultationRepository.findById(Number(id));

            if (!consultation) {
                return next(ApiError.badRequest('Консультация не найдена'));
            }

            if (consultation.consultation_status === "UPCOMING") {
                return next(ApiError.badRequest('Консультация еще не прошла'));
            }

            const updateConsultation = await this.consultationRepository.save(consultation.setComment(comment).setScore(rating));

            return res.status(200).json(updateConsultation);
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async completeConsultation(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const recommendations = req.files?.recommendations as UploadedFile;

            const fileName = await this.fileService.saveFile(recommendations);
            if (!fileName) {
                return next(ApiError.internal('Не удалось загрузить файл'));
            }

            const consultation = await this.consultationRepository.findById(Number(id));

            if (!consultation) {
                return next(ApiError.badRequest('Консультация не найдена'));
            }

            await this.consultationRepository.save(consultation.setConsultStatus("ARCHIVE").setRecomendation(fileName));
            res.status(200).json({ success: true, message: "Консультация успешно завершена и перенесена в архив" });
        } catch (e: any) {
            return next(ApiError.internal(e.message))
        }
    }

    private async addProblemsToConsultation(consultationId: number, problemIds: number[]): Promise<void> {
        try {
            const consultationProblems = problemIds.map(problemId => ({
                consultationId: consultationId,
                problemId: problemId
            }));

            await models.ConsultationProblems.bulkCreate(consultationProblems);

        } catch (error) {
            console.error('Ошибка при добавлении проблем к консультации:', error);
            throw error;
        }
    }
}

