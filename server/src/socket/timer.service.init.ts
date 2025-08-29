// infrastructure/web/services.ts
import ConsultationRepositoryImpl from "../core/application/repositories/consultations.repository.impl.js";
import TimeSlotRepositoryImpl from "../core/application/repositories/timeSlot.repository.impl.js";
import TimerServiceImpl from "../core/application/services/timer.service.impl.js";

export const consultationRepository = new ConsultationRepositoryImpl();
export const timeSlotRepository = new TimeSlotRepositoryImpl();

export const timerService = new TimerServiceImpl(
    consultationRepository,
    timeSlotRepository
);