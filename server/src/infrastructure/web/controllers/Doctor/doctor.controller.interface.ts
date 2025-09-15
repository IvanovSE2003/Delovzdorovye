import DoctorRepositoryImpl from "../../../../core/application/repositories/doctor.repository.impl.js";
import DoctorController from "./doctor.controller.js";
import ProfDataRepositoryImpl from "../../../../core/application/repositories/profData.repository.impl.js"
import UserRepositoryImpl from "../../../../core/application/repositories/user.repository.impl.js";
import SpecializationRepositoryImpl from "../../../../core/application/repositories/specializations.repository.impl.js";
import TimeSlotRepositoryImpl from "../../../../core/application/repositories/timeSlot.repository.impl.js";
import FileServiceImpl from "../../../../core/application/services/file.service.impl.js";
import NotificationRepositoryImpl from "../../../../core/application/repositories/notification.repository.impl.js"

const DoctorRepository = new DoctorRepositoryImpl();
const UserRepository = new UserRepositoryImpl();
const ProfDataRepository = new ProfDataRepositoryImpl();
const SpecializationRepository = new SpecializationRepositoryImpl();
const TimeSlotRepository = new TimeSlotRepositoryImpl();
const FileService = new FileServiceImpl();
const NotificationRepository = new NotificationRepositoryImpl();

const docotrController = new DoctorController(
    DoctorRepository, 
    ProfDataRepository, 
    FileService, 
    UserRepository, 
    SpecializationRepository,
    TimeSlotRepository,
    NotificationRepository
);

export default docotrController;