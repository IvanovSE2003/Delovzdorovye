import DoctorRepositoryImpl from "../../../../core/application/repositories/doctor.repository.impl.js";
import DoctorController from "./doctor.controller.js";
import ProfDataRepositoryImpl from "../../../../core/application/repositories/profData.repository.impl.js"
import FileServiceImpt from "../../../../core/application/services/file.service.impl.js";
import UserRepositoryImpl from "../../../../core/application/repositories/user.repository.impl.js";
import SpecializationRepositoryImpl from "../../../../core/application/repositories/specializations.repository.impl.js";

const DoctorRepository = new DoctorRepositoryImpl();
const FileService = new FileServiceImpt();
const UserRepository = new UserRepositoryImpl(FileService);
const ProfDataRepository = new ProfDataRepositoryImpl();
const SpecializationRepository = new SpecializationRepositoryImpl();

const docotrController = new DoctorController(DoctorRepository, ProfDataRepository, FileService, UserRepository, SpecializationRepository);

export default docotrController;