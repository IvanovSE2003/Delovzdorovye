import ConsultationRepositoryImpl from "../../../../core/application/repositories/consultations.repository.impl.js";
import DoctorRepositoryImpl from "../../../../core/application/repositories/doctor.repository.impl.js";
import DoctorScheduleRepositoryImpl from "../../../../core/application/repositories/doctorSchedule.repository.impl.js";
import ProblemRepositoryImpl from "../../../../core/application/repositories/problem.repository.impl.js";
import TimeSlotRepositoryImpl from "../../../../core/application/repositories/timeSlot.repository.impl.js";
import UserRepositoryImpl from "../../../../core/application/repositories/user.repository.impl.js";
import { timerService } from "../../../../socket/timer.service.init.js";
import ConsultationController from "./consultation.controller.js";
import FileServiceImpl from "../../../../core/application/services/file.service.impl.js"

const problemRepository = new ProblemRepositoryImpl();
const consultationRepository = new ConsultationRepositoryImpl();
const userRepository = new UserRepositoryImpl();
const doctorRepository = new DoctorRepositoryImpl();
const timeSlotRepository = new TimeSlotRepositoryImpl();
const doctorScheduleRepository = new DoctorScheduleRepositoryImpl();
const fileService = new FileServiceImpl();

const consultationController = new ConsultationController(
    problemRepository, 
    consultationRepository, 
    userRepository, 
    doctorRepository, 
    timeSlotRepository, 
    timerService,
    doctorScheduleRepository,
    fileService
);

export default consultationController;