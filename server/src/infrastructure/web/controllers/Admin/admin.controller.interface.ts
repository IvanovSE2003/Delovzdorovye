import BatchController from "./admin.controller.js";
import BasicDataRepositoryImpl from '../../../../core/application/repositories/basicData.repository.impl.js'
import DoctorRepositoryImpl from "../../../../core/application/repositories/doctor.repository.impl.js";
import UserRepositoryImpl from "../../../../core/application/repositories/user.repository.impl.js";
import ConsultationRepositoryImpl from "../../../../core/application/repositories/consultations.repository.impl.js";
import ProfDataRepositoryImpl from "../../../../core/application/repositories/profData.repository.impl.js";
import NotificationRepositoryImpl from "../../../../core/application/repositories/notification.repository.impl.js";

const BasicDataRepository = new BasicDataRepositoryImpl();
const ProfDataRepository = new ProfDataRepositoryImpl();
const DoctorRepository = new DoctorRepositoryImpl();
const UserRepository = new UserRepositoryImpl();
const consultationRepository = new ConsultationRepositoryImpl();
const notificationRepositoryImpl = new NotificationRepositoryImpl();

const adminController = new BatchController(
    BasicDataRepository,
    ProfDataRepository,
    DoctorRepository,
    UserRepository,
    consultationRepository,
    notificationRepositoryImpl
);

export default adminController;