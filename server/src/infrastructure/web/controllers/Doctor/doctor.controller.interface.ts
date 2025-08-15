import DoctorRepositoryImpl from "../../../../core/application/repositories/doctor.repository.impl.js";
import DoctorController from "./doctor.controller.js";
import BatchRepositoryImpl from "../../../../core/application/repositories/batch.repository.impl.js";
import FileServiceImpt from "../../../../core/application/services/file.service.impl.js";

const DoctorRepository = new DoctorRepositoryImpl();
const FileService = new FileServiceImpt();
const BatchRepository = new BatchRepositoryImpl();

const docotrController = new DoctorController(DoctorRepository, BatchRepository, FileService);

export default docotrController;