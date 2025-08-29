import BatchRepositoryImpl from "../../../../core/application/repositories/batch.repository.impl.js";
import BatchController from "./batch.controller.js";
import DoctorRepositoryImpl from "../../../../core/application/repositories/doctor.repository.impl.js";
import UserRepositoryImpl from "../../../../core/application/repositories/user.repository.impl.js";
import ConsultationRepositoryImpl from "../../../../core/application/repositories/consultations.repository.impl.js";

const BatchRepository = new BatchRepositoryImpl();
const DoctorRepository = new DoctorRepositoryImpl();
const UserRepository = new UserRepositoryImpl();
const consultationRepository = new ConsultationRepositoryImpl();
const batchController = new BatchController(BatchRepository, DoctorRepository, UserRepository, consultationRepository);

export default batchController;