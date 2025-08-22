import DoctorScheduleRepositoryImpl from "../../../../core/application/repositories/doctorSchedule.repository.impl.js"
import UserRepositoryImpl from "../../../../core/application/repositories/user.repository.impl.js";
import DoctorScheduleController from "./doctorSchedule.controller.js"

const DoctorScheduleRepository = new DoctorScheduleRepositoryImpl();
const userRepository = new UserRepositoryImpl();
const scheduleController = new DoctorScheduleController(DoctorScheduleRepository, userRepository);

export default scheduleController;