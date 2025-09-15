import NotificationRepositoryImpl from "../../../../core/application/repositories/notification.repository.impl";
import UserRepositoryImpl from "../../../../core/application/repositories/user.repository.impl";
import NotificationContorller from "./notification.controller";

const notificationReposiotory = new NotificationRepositoryImpl();
const userRepository = new UserRepositoryImpl();
const notificationContorller = new NotificationContorller(notificationReposiotory, userRepository);

export default notificationContorller;