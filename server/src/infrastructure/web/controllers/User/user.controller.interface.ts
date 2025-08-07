// infrastructure/web/controllers/userControllerInstance.js
import { AuthServiceImpl } from "../../../../core/application/services/auth.service.impl.js";
import UserRepositoryImpl from "../../../../core/application/repositories/user.repository.impl.js";
import TokenServiceImpl from "../../../../core/application/services/token.service.impl.js";
import MailServiceImpl from "../../../../core/application/services/mail.service.impl.js";
import UserController from "./user.controller.js";
import TwoFactorServiceImpl from "../../../../core/application/services/twoFactor.service.impl.js";
import SmsServiceImpl from "../../../../core/application/services/sms.service.impl.js";
import PatientRepositoryImpl from "../../../../core/application/repositories/patient.repository.impl.js";
import TelegramServiceImpl from "../../../../core/application/services/telegram.service.impl.js";

const TelegramService = new TelegramServiceImpl();
const userRepository = new UserRepositoryImpl();
const patientRepository = new PatientRepositoryImpl();
const tokenService = new TokenServiceImpl(process.env.SECRET_KEY_ACCESS as string, process.env.SECRET_KEY_REFRESH as string);
const mailService = new MailServiceImpl();
const SmsService = new SmsServiceImpl(TelegramService);
const twoFactorService = new TwoFactorServiceImpl(mailService, SmsService, process.env.TEMP_SECRET as string)

const authService = new AuthServiceImpl(userRepository, patientRepository, null, tokenService, mailService, SmsService, twoFactorService);
const userController = new UserController(authService, userRepository, tokenService);

export default userController;