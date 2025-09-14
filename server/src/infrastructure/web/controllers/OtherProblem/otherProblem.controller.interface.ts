import OtherProblemReposiotoryImpl from "../../../../core/application/repositories/otherProblem.repository.impl";
import UserRepositoryImpl from "../../../../core/application/repositories/user.repository.impl"
import FileServiceImpl from "../../../../core/application/services/file.service.impl";
import OtherProblemController from "./otherProblem.controller";

const otherProblemRepository = new OtherProblemReposiotoryImpl();
const fileService = new FileServiceImpl();
const userRepository = new UserRepositoryImpl(fileService);
const otherProblemController = new OtherProblemController(otherProblemRepository, userRepository);

export default otherProblemController;