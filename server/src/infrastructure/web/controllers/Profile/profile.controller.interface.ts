import DoctorRepositoryImpl from "../../../../core/application/repositories/doctor.repository.impl.js";
import PatientRepositoryImpl from "../../../../core/application/repositories/patient.repository.impl.js";
import UserRepositoryImpl from "../../../../core/application/repositories/user.repository.impl.js";
import ProfileController from "./profile.controller.js";

const userRepository = new UserRepositoryImpl();
const patientRepository = new PatientRepositoryImpl();
const doctorRepository = new DoctorRepositoryImpl();
const profileController = new ProfileController(userRepository, patientRepository, doctorRepository);

export default profileController;