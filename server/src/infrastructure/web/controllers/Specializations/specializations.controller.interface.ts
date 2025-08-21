import SpecializationsRepositoryImpl from "../../../../core/application/repositories/specializations.repository.impl.js";
import SpecializationController from "./specializations.controller.js";

const specializationReposotory = new SpecializationsRepositoryImpl();
const specializationController = new SpecializationController(specializationReposotory);

export default specializationController;