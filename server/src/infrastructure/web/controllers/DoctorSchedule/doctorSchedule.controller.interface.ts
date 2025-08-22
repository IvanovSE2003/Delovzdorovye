import DoctorRepositoryImpl from "../../../../core/application/repositories/doctor.repository.impl.js";
import DoctorScheduleRepositoryImpl from "../../../../core/application/repositories/doctorSchedule.repository.impl.js";
import UserRepositoryImpl from "../../../../core/application/repositories/user.repository.impl.js";
import DoctorScheduleController from "./doctorSchedule.controller.js"

const DoctorScheduleRepository = new DoctorScheduleRepositoryImpl();
const userRepository = new UserRepositoryImpl();
const doctorRepository = new DoctorRepositoryImpl();
const scheduleController = new DoctorScheduleController(DoctorScheduleRepository, doctorRepository, userRepository);

export default scheduleController;