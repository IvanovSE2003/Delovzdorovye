import ConsultationRepositoryImpl from "../../../../core/application/repositories/consultations.repository.impl.js";
import DoctorRepositoryImpl from "../../../../core/application/repositories/doctor.repository.impl.js";
import ProblemRepositoryImpl from "../../../../core/application/repositories/problem.repository.impl.js";
import TimeSlotRepositoryImpl from "../../../../core/application/repositories/timeSlot.repository.impl.js";
import UserRepositoryImpl from "../../../../core/application/repositories/user.repository.impl.js";
import TimerServiceImpl from "../../../../core/application/services/timer.service.impl.js";
import ConsultationController from "./consultation.controller.js";


const problemRepository = new ProblemRepositoryImpl();
const consultationRepository = new ConsultationRepositoryImpl();
const userRepository = new UserRepositoryImpl();
const doctorReposiotry = new DoctorRepositoryImpl();
const timeSlotRepository = new TimeSlotRepositoryImpl();
const timerService = new TimerServiceImpl(consultationRepository, timeSlotRepository);
const consultationController = new ConsultationController(problemRepository, consultationRepository, userRepository, doctorReposiotry, timeSlotRepository, timerService);

export default consultationController;