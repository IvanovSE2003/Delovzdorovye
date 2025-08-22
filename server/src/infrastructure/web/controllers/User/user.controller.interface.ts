import { AuthServiceImpl } from "../../../../core/application/services/auth.service.impl.js";
import UserRepositoryImpl from "../../../../core/application/repositories/user.repository.impl.js";
import TokenServiceImpl from "../../../../core/application/services/token.service.impl.js";
import MailServiceImpl from "../../../../core/application/services/mail.service.impl.js";
import UserController from "./user.controller.js";
import TwoFactorServiceImpl from "../../../../core/application/services/twoFactor.service.impl.js";
import SmsServiceImpl from "../../../../core/application/services/sms.service.impl.js";
import PatientRepositoryImpl from "../../../../core/application/repositories/patient.repository.impl.js";
import DoctorRepositoryImpl from "../../../../core/application/repositories/doctor.repository.impl.js";
import TelegramServiceStart from "../../../../telegram/startTelegramBot.js";
import FileServiceImpt from "../../../../core/application/services/file.service.impl.js";
import BatchRepositoryImpl from "../../../../core/application/repositories/batch.repository.impl.js";
import SpecializationsRepositoryImpl from "../../../../core/application/repositories/specializations.repository.impl.js";

const userRepository = new UserRepositoryImpl();
const batchRepository = new BatchRepositoryImpl();
const fileService = new FileServiceImpt();
const patientRepository = new PatientRepositoryImpl();
const doctorRepository = new DoctorRepositoryImpl();
const tokenService = new TokenServiceImpl(process.env.SECRET_KEY_ACCESS as string, process.env.SECRET_KEY_REFRESH as string);
const mailService = new MailServiceImpl();
const SmsService = new SmsServiceImpl(TelegramServiceStart, userRepository);
const twoFactorService = new TwoFactorServiceImpl(mailService, SmsService, process.env.TEMP_SECRET as string)
const SpecializationRepository = new SpecializationsRepositoryImpl();

const authService = new AuthServiceImpl(userRepository, patientRepository, doctorRepository, tokenService, mailService, SmsService, twoFactorService, TelegramServiceStart, SpecializationRepository);
const userController = new UserController(authService, userRepository, tokenService, fileService, batchRepository);

export default userController;