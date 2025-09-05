import DoctorRepositoryImpl from "../../../../core/application/repositories/doctor.repository.impl.js";
import DoctorScheduleRepositoryImpl from "../../../../core/application/repositories/doctorSchedule.repository.impl.js";
import TimeSlotRepositoryImpl from "../../../../core/application/repositories/timeSlot.repository.impl.js";
import UserRepositoryImpl from "../../../../core/application/repositories/user.repository.impl.js";
import FileServiceImpt from "../../../../core/application/services/file.service.impl.js";
import DoctorScheduleController from "./doctorSchedule.controller.js"

const DoctorScheduleRepository = new DoctorScheduleRepositoryImpl();
const fileService = new FileServiceImpt();
const userRepository = new UserRepositoryImpl(fileService);
const doctorRepository = new DoctorRepositoryImpl();
const timeSlotRepository = new TimeSlotRepositoryImpl();
const scheduleController = new DoctorScheduleController(DoctorScheduleRepository, doctorRepository, userRepository, timeSlotRepository);

export default scheduleController;