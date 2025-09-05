import DoctorRepositoryImpl from "../../../../core/application/repositories/doctor.repository.impl.js";
import UserRepositoryImpl from "../../../../core/application/repositories/user.repository.impl.js";
import FileServiceImpt from "../../../../core/application/services/file.service.impl.js";
import ProfileController from "./profile.controller.js";

const fileService = new FileServiceImpt();
const userRepository = new UserRepositoryImpl(fileService);
const doctorRepository = new DoctorRepositoryImpl();
const profileController = new ProfileController(userRepository, doctorRepository);

export default profileController;