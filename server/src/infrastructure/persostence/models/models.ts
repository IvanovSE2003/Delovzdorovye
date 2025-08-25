import sequelize from '../db/db.js'
import { DataType } from 'sequelize-typescript'
import { UserModelInterface } from "../models/interfaces/user.model.js"
import {PatientModelInterface} from './interfaces/patient.model.js'
import { TelegramModelInterface } from './interfaces/telegram.model.js'
import { DoctorModelInterface } from './interfaces/doctor.model.js'
import { TokenModelInterface } from './interfaces/token.model.js'
import { DoctorScheduleModelInterface } from './interfaces/doctorSchedule.model.js'
import { BatchModelInterface } from './interfaces/batch.model.js'
import { SpecializationModelInterface } from './interfaces/specializations.model.js'
import { TimeSlotmModelInterface } from './interfaces/timeSlot.model.js'
import { ProblemModelInterface } from './interfaces/problem.model.js'

const UserModel = sequelize.define<UserModelInterface>('user', {
    id: {type: DataType.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataType.STRING, allowNull: true},
    surname: {type: DataType.STRING, allowNull: true}, 
    patronymic: {type: DataType.STRING, allowNull: true},
    email: {type: DataType.STRING, unique: true, allowNull: true},
    phone: {type: DataType.STRING, unique: true, allowNull: true},
    pin_code: {type: DataType.INTEGER, allowNull: false},
    time_zone: {type: DataType.INTEGER, allowNull: false},
    date_birth: {type: DataType.DATEONLY},
    gender: {type: DataType.STRING, allowNull: false},   
    isActivated: {type: DataType.BOOLEAN, defaultValue: false},
    isActivatedSMS: {type: DataType.BOOLEAN, defaultValue: false},
    activationLink: {type: DataType.STRING, allowNull: true},
    img: {type: DataType.STRING, defaultValue: "defaultImg.jpg"},
    role: {type: DataType.STRING, defaultValue: "PATIENT"},
    twoFactorCode: {type: DataType.STRING, allowNull: true},
    twoFactorCodeExpires: {type: DataType.DATE, allowNull: true},
    resetToken: {type: DataType.STRING, allowNull: true},
    resetTokenExpires: {type: DataType.DATE, allowNull: true},
    pinAttempts: {type: DataType.INTEGER, defaultValue: 0},
    isBlocked: {type: DataType.BOOLEAN, defaultValue: false},
    blockedUntil: {type: DataType.DATE, allowNull: true},
    sentChanges: {type: DataType.BOOLEAN, allowNull: true, defaultValue: false},
    isAnonymous: {type: DataType.BOOLEAN, allowNull: true, defaultValue: false},
})

const UserTelegramModel = sequelize.define<TelegramModelInterface>('telegram_user', {
    id: {type: DataType.INTEGER, primaryKey: true, autoIncrement: true},
    telegram_chat_id : {type: DataType.BIGINT, allowNull: false, unique: true}
}) 

const TokenModel = sequelize.define<TokenModelInterface>('token', {
    id: {type: DataType.INTEGER, primaryKey: true, autoIncrement: true},
    userId: {type: DataType.INTEGER},
    refreshToken: {type: DataType.TEXT, allowNull: false}
})

const PatientModel = sequelize.define<PatientModelInterface>('patient', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    activate: { type: DataType.BOOLEAN, defaultValue: true }
});

const DoctorModel = sequelize.define<DoctorModelInterface>('doctor', {
    id: {type: DataType.INTEGER, primaryKey: true, autoIncrement: true},
    experience_years: {type: DataType.INTEGER},
    diploma: {type: DataType.STRING,  allowNull: true},
    license: {type: DataType.STRING,  allowNull: true},
    isActivated: {type: DataType.BOOLEAN, defaultValue: false}
});

const SpecializationModel = sequelize.define<SpecializationModelInterface>('specialization', {
    id: {type: DataType.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataType.STRING}
});

const RatingModel = sequelize.define('rating', {
    id: {type: DataType.INTEGER, primaryKey: true, autoIncrement: true},
    score: {type: DataType.INTEGER},
    comment: {type: DataType.TEXT, allowNull: true}
});

const ProblemModel = sequelize.define<ProblemModelInterface>('problem', {
    id: {type: DataType.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataType.STRING}
})

const Consultation = sequelize.define('consultation', {
    id: {type: DataType.INTEGER, primaryKey: true, autoIncrement: true},
    consultation_status: {type: DataType.STRING},
    payment_status: {type: DataType.STRING},
    other_problem: {type: DataType.TEXT, allowNull: true},
    recommendations: {type: DataType.STRING},
    duration: {type: DataType.INTEGER, allowNull: true}
})

const DoctorsSchedule = sequelize.define<DoctorScheduleModelInterface>('doctors_schedule', {
    id: {type: DataType.INTEGER, primaryKey: true, autoIncrement: true},
    date: {type: DataType.DATE},
    day_weekly: {type: DataType.STRING},
    time_start: {type: DataType.TIME, defaultValue: "8:00"},
    time_end: {type: DataType.TIME, defaultValue: "20:00"},
})

const TimeSlot = sequelize.define<TimeSlotmModelInterface>('time_slot', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    time: { type: DataType.TIME },
    isAvailable: { type: DataType.BOOLEAN, defaultValue: true } 
});

const Transaction = sequelize.define('transaction', {
    id: {type: DataType.INTEGER, primaryKey: true, autoIncrement: true},
    sum: {type: DataType.INTEGER},
    status: {type: DataType.STRING},
    date: {type: DataType.DATE}
})

const ModerationBatchModel = sequelize.define<BatchModelInterface>('moderation_batch', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    status: { type: DataType.STRING, defaultValue: 'pending'}, // pending, approved, rejected
    rejection_reason: { type: DataType.TEXT, allowNull: true },
    is_urgent: { type: DataType.BOOLEAN, defaultValue: false },
    field_name: { type: DataType.STRING, allowNull: false },
    old_value: { type: DataType.TEXT, allowNull: true },
    new_value: { type: DataType.TEXT, allowNull: false }
});

UserModel.hasOne(ModerationBatchModel);
ModerationBatchModel.belongsTo(UserModel);

UserModel.hasOne(DoctorModel)
DoctorModel.belongsTo(UserModel)

UserModel.hasOne(PatientModel)
PatientModel.belongsTo(UserModel)

UserModel.hasOne(Transaction)
Transaction.belongsTo(UserModel)

UserModel.hasOne(UserTelegramModel)
UserTelegramModel.belongsTo(UserModel)

Consultation.hasOne(Transaction)
Transaction.belongsTo(Consultation)

PatientModel.hasOne(Consultation)
Consultation.belongsTo(PatientModel)

DoctorModel.hasOne(Consultation)
Consultation.belongsTo(DoctorModel)

DoctorModel.hasOne(DoctorsSchedule)
DoctorsSchedule.belongsTo(DoctorModel)

UserModel.hasOne(TokenModel)
TokenModel.belongsTo(UserModel)

DoctorsSchedule.hasMany(TimeSlot);
TimeSlot.belongsTo(DoctorsSchedule);

DoctorModel.belongsToMany(SpecializationModel, { through: 'doctor_specializations' });
SpecializationModel.belongsToMany(DoctorModel, { through: 'doctor_specializations' });

Consultation.belongsToMany(ProblemModel, { through: 'consultation_problems' });
ProblemModel.belongsToMany(Consultation, { through: 'consultation_problems' });

Consultation.hasOne(RatingModel);
RatingModel.belongsTo(Consultation);

PatientModel.hasMany(RatingModel);
RatingModel.belongsTo(PatientModel);

DoctorModel.hasMany(RatingModel);
RatingModel.belongsTo(DoctorModel);


export default {
    UserModel,
    DoctorModel,
    PatientModel,
    Transaction,
    Consultation,
    DoctorsSchedule,
    TokenModel,
    UserTelegramModel,
    TimeSlot,
    ModerationBatchModel,
    SpecializationModel,
    RatingModel,
    ProblemModel
}