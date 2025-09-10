import OtherProblemReposiotoryImpl from "../../../../core/application/repositories/otherProblem.repository.impl";
import OtherProblemController from "./otherProblem.controller";

const otherProblemRepository = new OtherProblemReposiotoryImpl();
const otherProblemController = new OtherProblemController(otherProblemRepository);

export default otherProblemController;