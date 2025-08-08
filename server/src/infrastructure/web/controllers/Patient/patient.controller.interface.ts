import PatientController from "./patient.controller.js";
import PatientRepositoryImpl from "../../../../core/application/repositories/patient.repository.impl.js";

const PatientRepository = new PatientRepositoryImpl();

const patientController = new PatientController(PatientRepository);

export default patientController;