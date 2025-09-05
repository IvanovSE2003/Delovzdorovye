import BatchController from "./admin.controller.js";
import BasicDataRepositoryImpl from '../../../../core/application/repositories/basicData.repository.impl.js'
import DoctorRepositoryImpl from "../../../../core/application/repositories/doctor.repository.impl.js";
import UserRepositoryImpl from "../../../../core/application/repositories/user.repository.impl.js";
import ConsultationRepositoryImpl from "../../../../core/application/repositories/consultations.repository.impl.js";
import ProfDataRepositoryImpl from "../../../../core/application/repositories/profData.repository.impl.js";
import FileServiceImpt from "../../../../core/application/services/file.service.impl.js";

const BasicDataRepository = new BasicDataRepositoryImpl();
const ProfDataRepository = new ProfDataRepositoryImpl();
const DoctorRepository = new DoctorRepositoryImpl();
const fileService = new FileServiceImpt();
const UserRepository = new UserRepositoryImpl(fileService);
const consultationRepository = new ConsultationRepositoryImpl();
const adminController = new BatchController(BasicDataRepository, ProfDataRepository, DoctorRepository, UserRepository, consultationRepository);

export default adminController;