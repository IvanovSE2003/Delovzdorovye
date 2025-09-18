import NotificationRepositoryImpl from "../../../../core/application/repositories/notification.repository.impl";
import OtherProblemReposiotoryImpl from "../../../../core/application/repositories/otherProblem.repository.impl";
import UserRepositoryImpl from "../../../../core/application/repositories/user.repository.impl"
import OtherProblemController from "./otherProblem.controller";

const otherProblemRepository = new OtherProblemReposiotoryImpl();
const userRepository = new UserRepositoryImpl();
const notificationRepository = new NotificationRepositoryImpl();
const otherProblemController = new OtherProblemController(otherProblemRepository, userRepository, notificationRepository);

export default otherProblemController;