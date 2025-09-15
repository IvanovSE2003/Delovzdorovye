import DoctorRepositoryImpl from "../../../../core/application/repositories/doctor.repository.impl.js";
import UserRepositoryImpl from "../../../../core/application/repositories/user.repository.impl.js";
import ProfileController from "./profile.controller.js";

const userRepository = new UserRepositoryImpl();
const doctorRepository = new DoctorRepositoryImpl();
const profileController = new ProfileController(userRepository, doctorRepository);

export default profileController;