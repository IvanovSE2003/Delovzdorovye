import NotificationRepositoryImpl from "../../../../core/application/repositories/notification.repository.impl";
import UserRepositoryImpl from "../../../../core/application/repositories/user.repository.impl";
import FileServiceImpt from "../../../../core/application/services/file.service.impl";
import NotificationContorller from "./notification.controller";

const notificationReposiotory = new NotificationRepositoryImpl();
const fileService = new FileServiceImpt();
const userRepository = new UserRepositoryImpl(fileService);
const notificationContorller = new NotificationContorller(notificationReposiotory, userRepository);

export default notificationContorller;