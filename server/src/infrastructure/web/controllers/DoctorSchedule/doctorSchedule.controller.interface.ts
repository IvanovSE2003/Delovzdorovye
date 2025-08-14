import DoctorScheduleRepositoryImpl from "../../../../core/application/repositories/doctorSchedule.repository.impl.js"
import DoctorScheduleController from "./doctorSchedule.controller.js"

const DoctorScheduleRepository = new DoctorScheduleRepositoryImpl();
const scheduleController = new DoctorScheduleController(DoctorScheduleRepository);

export default scheduleController;