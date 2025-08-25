import ConsultationRepositoryImpl from "../../../../core/application/repositories/consultations.repository.impl.js";
import ProblemRepositoryImpl from "../../../../core/application/repositories/problem.repository.impl.js";
import ConsultationController from "./consultation.controller.js";


const problemRepository = new ProblemRepositoryImpl();
const consultationRepository = new ConsultationRepositoryImpl();
const consultationController = new ConsultationController(problemRepository, consultationRepository);

export default consultationController;