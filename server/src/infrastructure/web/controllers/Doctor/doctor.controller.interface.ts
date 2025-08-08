import DoctorRepositoryImpl from "../../../../core/application/repositories/doctor.repository.impl.js";
import DoctorController from "./doctor.controller.js";

const DoctorRepository = new DoctorRepositoryImpl();

const docotrController = new DoctorController(DoctorRepository);

export default docotrController;