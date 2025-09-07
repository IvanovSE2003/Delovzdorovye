import ConsultationRepositoryImpl from "../../../../core/application/repositories/consultations.repository.impl.js";
import DoctorRepositoryImpl from "../../../../core/application/repositories/doctor.repository.impl.js";
import ProblemRepositoryImpl from "../../../../core/application/repositories/problem.repository.impl.js";
import TimeSlotRepositoryImpl from "../../../../core/application/repositories/timeSlot.repository.impl.js";
import UserRepositoryImpl from "../../../../core/application/repositories/user.repository.impl.js";
import { timerService } from "../../../../socket/timer.service.init.js";
import ConsultationController from "./consultation.controller.js";
import FileServiceImpl from "../../../../core/application/services/file.service.impl.js"
import NotificationRepositoryImpl from "../../../../core/application/repositories/notification.repository.impl.js";

const problemRepository = new ProblemRepositoryImpl();
const consultationRepository = new ConsultationRepositoryImpl();
const fileService = new FileServiceImpl();
const userRepository = new UserRepositoryImpl(fileService);
const doctorRepository = new DoctorRepositoryImpl();
const timeSlotRepository = new TimeSlotRepositoryImpl();
const notificationRepository = new NotificationRepositoryImpl();

const consultationController = new ConsultationController(
    problemRepository, 
    consultationRepository, 
    userRepository, 
    doctorRepository, 
    timeSlotRepository,
    fileService,
    notificationRepository
);

export default consultationController;