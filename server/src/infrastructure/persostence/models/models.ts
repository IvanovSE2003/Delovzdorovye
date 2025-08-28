import sequelize from '../db/db.js'
import { DataType } from 'sequelize-typescript'
import { UserModelInterface } from "../models/interfaces/user.model.js"
import { TelegramModelInterface } from './interfaces/telegram.model.js'
import { DoctorModelInterface } from './interfaces/doctor.model.js'
import { TokenModelInterface } from './interfaces/token.model.js'
import { DoctorScheduleModelInterface } from './interfaces/doctorSchedule.model.js'
import { BatchModelInterface } from './interfaces/batch.model.js'
import { SpecializationModelInterface } from './interfaces/specializations.model.js'
import { TimeSlotmModelInterface } from './interfaces/timeSlot.model.js'
import { ProblemModelInterface } from './interfaces/problem.model.js'
import { ConsultationModelInterface } from './interfaces/consultation.model.js'

const UserModel = sequelize.define<UserModelInterface>('user', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataType.STRING, allowNull: true },
    surname: { type: DataType.STRING, allowNull: true },
    patronymic: { type: DataType.STRING, allowNull: true },
    email: { type: DataType.STRING, allowNull: true },
    phone: { type: DataType.STRING, allowNull: true },
    pin_code: { type: DataType.INTEGER, allowNull: false },
    time_zone: { type: DataType.INTEGER, allowNull: false },
    date_birth: { type: DataType.DATEONLY, allowNull: true },
    gender: { type: DataType.STRING, allowNull: true },
    isActivated: { type: DataType.BOOLEAN, defaultValue: false },
    isActivatedSMS: { type: DataType.BOOLEAN, defaultValue: false },
    activationLink: { type: DataType.STRING, allowNull: true },
    img: { type: DataType.STRING, defaultValue: "defaultImg.jpg" },
    role: { type: DataType.STRING, defaultValue: "PATIENT" },
    twoFactorCode: { type: DataType.STRING, allowNull: true },
    twoFactorCodeExpires: { type: DataType.DATE, allowNull: true },
    resetToken: { type: DataType.STRING, allowNull: true },
    resetTokenExpires: { type: DataType.DATE, allowNull: true },
    pinAttempts: { type: DataType.INTEGER, defaultValue: 0 },
    isBlocked: { type: DataType.BOOLEAN, defaultValue: false },
    blockedUntil: { type: DataType.DATE, allowNull: true },
    sentChanges: { type: DataType.BOOLEAN, allowNull: true, defaultValue: false },
    isAnonymous: { type: DataType.BOOLEAN, allowNull: true, defaultValue: false },
})

const UserTelegramModel = sequelize.define<TelegramModelInterface>('telegram_user', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    telegram_chat_id: { type: DataType.BIGINT, allowNull: false, unique: true }
})

const TokenModel = sequelize.define<TokenModelInterface>('token', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataType.INTEGER },
    refreshToken: { type: DataType.TEXT, allowNull: false }
})

const DoctorModel = sequelize.define<DoctorModelInterface>('doctor', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    experience_years: { type: DataType.INTEGER },
    isActivated: { type: DataType.BOOLEAN, defaultValue: false }
});

const SpecializationModel = sequelize.define<SpecializationModelInterface>('specialization', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataType.STRING }
});

const ProblemModel = sequelize.define<ProblemModelInterface>('problem', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataType.STRING }
})

const Consultation = sequelize.define<ConsultationModelInterface>('consultation', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    consultation_status: { type: DataType.STRING },
    payment_status: { type: DataType.STRING }, // pending,  confirmed, in_progress, completed - завершена, cancelled - отменена , rescheduled - перенесена
    other_problem: { type: DataType.TEXT, allowNull: true }, // pending, paid, refunded - возвращено, cancelled - отменено
    recommendations: { type: DataType.STRING },
    duration: { type: DataType.INTEGER, allowNull: true },
    score: { type: DataType.INTEGER, allowNull: true},
    comment: { type: DataType.TEXT, allowNull: true }
})

const DoctorsSchedule = sequelize.define<DoctorScheduleModelInterface>('doctors_schedule', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    date: { type: DataType.DATE },
    day_weekly: { type: DataType.STRING },
    time_start: { type: DataType.TIME, defaultValue: "8:00" },
    time_end: { type: DataType.TIME, defaultValue: "20:00" },
})

const TimeSlot = sequelize.define<TimeSlotmModelInterface>('time_slot', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    time: { type: DataType.TIME },
    isAvailable: { type: DataType.BOOLEAN, defaultValue: true }
});

const Transaction = sequelize.define('transaction', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    sum: { type: DataType.INTEGER },
    status: { type: DataType.STRING },
    date: { type: DataType.DATE }
})

const ModerationBatchModel = sequelize.define<BatchModelInterface>('moderation_batch', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    status: { type: DataType.STRING, defaultValue: 'pending' }, // pending, approved, rejected
    rejection_reason: { type: DataType.TEXT, allowNull: true },
    is_urgent: { type: DataType.BOOLEAN, defaultValue: false },
    field_name: { type: DataType.STRING, allowNull: false },
    old_value: { type: DataType.TEXT, allowNull: true },
    new_value: { type: DataType.TEXT, allowNull: false }
});

const DoctorSpecialization = sequelize.define('doctor_specializations', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    diploma: { type: DataType.STRING, allowNull: true },
    license: { type: DataType.STRING, allowNull: true }
});

const ProblemSpecialization = sequelize.define('problem_specializations', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true }
});

ProblemModel.belongsToMany(SpecializationModel, { through: ProblemSpecialization });
SpecializationModel.belongsToMany(ProblemModel, { through: ProblemSpecialization });

UserModel.hasOne(ModerationBatchModel);
ModerationBatchModel.belongsTo(UserModel);

UserModel.hasOne(DoctorModel)
DoctorModel.belongsTo(UserModel)

UserModel.hasOne(Transaction)
Transaction.belongsTo(UserModel)

UserModel.hasOne(UserTelegramModel)
UserTelegramModel.belongsTo(UserModel)

Consultation.hasOne(Transaction)
Transaction.belongsTo(Consultation)

DoctorModel.hasOne(Consultation)
Consultation.belongsTo(DoctorModel)

UserModel.hasOne(Consultation);
Consultation.belongsTo(UserModel);

DoctorModel.hasMany(DoctorsSchedule, { foreignKey: "doctorId" });
DoctorsSchedule.belongsTo(DoctorModel, { foreignKey: "doctorId" });

UserModel.hasOne(TokenModel)
TokenModel.belongsTo(UserModel)

DoctorsSchedule.hasMany(TimeSlot, { foreignKey: "doctorsScheduleId" });
TimeSlot.belongsTo(DoctorsSchedule, { foreignKey: "doctorsScheduleId" });

DoctorModel.belongsToMany(SpecializationModel, { through: DoctorSpecialization });
SpecializationModel.belongsToMany(DoctorModel, { through: DoctorSpecialization });

Consultation.belongsToMany(ProblemModel, { through: 'consultation_problems' });
ProblemModel.belongsToMany(Consultation, { through: 'consultation_problems' });

export default {
    UserModel,
    DoctorModel,
    Transaction,
    Consultation,
    DoctorsSchedule,
    TokenModel,
    UserTelegramModel,
    TimeSlot,
    ModerationBatchModel,
    SpecializationModel,
    ProblemModel,
    DoctorSpecialization,
    ProblemSpecialization
}