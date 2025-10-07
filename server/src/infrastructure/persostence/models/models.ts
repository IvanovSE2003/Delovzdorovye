import sequelize from '../db/db.js'
import { DataType } from 'sequelize-typescript'
import { UserModelInterface } from "../models/interfaces/user.model.js"
import { TelegramModelInterface } from './interfaces/telegram.model.js'
import { DoctorModelInterface } from './interfaces/doctor.model.js'
import { TokenModelInterface } from './interfaces/token.model.js'
import { BatchModelInterface } from './interfaces/batch.model.js'
import { SpecializationModelInterface } from './interfaces/specializations.model.js'
import { TimeSlotmModelInterface } from './interfaces/timeSlot.model.js'
import { ProblemModelInterface } from './interfaces/problem.model.js'
import { ConsultationModelInterface } from './interfaces/consultation.model.js'
import { ProfDataModelInterface } from './interfaces/profData.model.js'
import { NotificationModelInterface } from './interfaces/notification.model.js'
import { ConsulationRoomModelInterface } from './interfaces/consulationRoom.model.js'
import { ContentModelInterface } from './interfaces/content.model.js'
import { BreakModelInterface } from './interfaces/break.model.js'

const UserModel = sequelize.define<UserModelInterface>('user', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataType.STRING, allowNull: true },
    surname: { type: DataType.STRING, allowNull: true },
    patronymic: { type: DataType.STRING, allowNull: true },
    email: { type: DataType.STRING, unique: true, allowNull: true },
    phone: { type: DataType.STRING, unique: true, allowNull: true },
    pin_code: { type: DataType.INTEGER, allowNull: false },
    time_zone: { type: DataType.INTEGER, allowNull: false },
    date_birth: { type: DataType.DATEONLY, allowNull: true },
    gender: { type: DataType.STRING, allowNull: true },
    img: { type: DataType.STRING },
    role: { type: DataType.STRING, defaultValue: "PATIENT" },
    pending_img: { type: DataType.STRING, allowNull: true },
    pending_name: { type: DataType.STRING, allowNull: true },
    pending_surname: { type: DataType.STRING, allowNull: true },
    pending_patronymic: { type: DataType.STRING, allowNull: true },
    pending_date_birth: { type: DataType.DATEONLY, allowNull: true },
    pending_gender: { type: DataType.STRING, allowNull: true },
    hasPendingChanges: { type: DataType.BOOLEAN, defaultValue: false, allowNull: true, field: 'has_pending_changes' },
    isActivated: { type: DataType.BOOLEAN, defaultValue: false, field: 'is_activated' },
    isActivatedSMS: { type: DataType.BOOLEAN, defaultValue: false, field: 'is_activatedsms' },
    activationLink: { type: DataType.STRING, allowNull: true, field: 'activation_link' },
    twoFactorCode: { type: DataType.STRING, allowNull: true, field: 'two_factor_code' },
    twoFactorCodeExpires: { type: DataType.DATE, allowNull: true, field: 'two_factor_code_expires' },
    resetToken: { type: DataType.STRING, allowNull: true, field: 'reset_token' },
    resetTokenExpires: { type: DataType.DATE, allowNull: true, field: 'reset_token_expires' },
    pinAttempts: { type: DataType.INTEGER, defaultValue: 0, field: 'pin_attempts' },
    isBlocked: { type: DataType.BOOLEAN, defaultValue: false, field: 'is_blocked' },
    blockedUntil: { type: DataType.DATE, allowNull: true, field: 'blocked_until' },
    sentChanges: { type: DataType.BOOLEAN, allowNull: true, defaultValue: false, field: 'sent_changes' },
    isAnonymous: { type: DataType.BOOLEAN, allowNull: true, defaultValue: false, field: 'is_anonymous' },
});


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
    isActivated: { type: DataType.BOOLEAN, defaultValue: false },
    competencies: { type: DataType.ARRAY(DataType.INTEGER), defaultValue: [] }
});

const SpecializationModel = sequelize.define<SpecializationModelInterface>('specialization', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataType.STRING }
});

const ProblemModel = sequelize.define<ProblemModelInterface>('problem', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataType.STRING }
})

const DoctorSlots = sequelize.define<TimeSlotmModelInterface>('time_slot', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    time: { type: DataType.TIME },
    date: { type: DataType.DATEONLY },
    dayWeek: { type: DataType.INTEGER },
    status: { type: DataType.STRING },
});

const Consultation = sequelize.define<ConsultationModelInterface>('consultation', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    consultation_status: { type: DataType.STRING },
    payment_status: { type: DataType.STRING },
    problem_description: { type: DataType.TEXT, allowNull: true },
    has_other_problem: {type: DataType.BOOLEAN, defaultValue: false},
    recommendations: { type: DataType.STRING, allowNull: true },
    duration: { type: DataType.INTEGER, allowNull: true },
    score: { type: DataType.INTEGER, allowNull: true },
    comment: { type: DataType.TEXT, allowNull: true },
    reservation_expires_at: { type: DataType.DATE, allowNull: true },
    reason_cancel: { type: DataType.TEXT, allowNull: true },
    time: { type: DataType.STRING },
    date: { type: DataType.DATEONLY },
    doctorId: { type: DataType.INTEGER, allowNull: false, references: { model: DoctorModel, key: 'id' } },
    userId: { type: DataType.INTEGER, allowNull: false, references: { model: UserModel, key: 'id' } },
})

const Transaction = sequelize.define('transaction', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    sum: { type: DataType.INTEGER },
    status: { type: DataType.STRING },
    date: { type: DataType.DATE }
})

const BasicDataModel = sequelize.define<BatchModelInterface>('basic_data_records', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    status: { type: DataType.STRING },
    rejection_reason: { type: DataType.TEXT, allowNull: true },
    is_urgent: { type: DataType.BOOLEAN, defaultValue: false },
    field_name: { type: DataType.STRING, allowNull: false },
    old_value: { type: DataType.TEXT, allowNull: true },
    new_value: { type: DataType.TEXT, allowNull: false }
});

const ProfDataModel = sequelize.define<ProfDataModelInterface>('prof_data_records', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    new_diploma: { type: DataType.STRING },
    new_license: { type: DataType.STRING },
    new_specialization: { type: DataType.STRING },
    comment: { type: DataType.TEXT, allowNull: true },
    type: { type: DataType.STRING, defaultValue: 'ADD' }
});

const DoctorSpecialization = sequelize.define('doctor_specialization', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    diploma: { type: DataType.STRING, allowNull: true },
    license: { type: DataType.STRING, allowNull: true },
    doctorId: { type: DataType.INTEGER, allowNull: false, references: { model: DoctorModel, key: 'id' } },
    specializationId: { type: DataType.INTEGER, allowNull: false, references: { model: SpecializationModel, key: 'id' } }
});

const ConsultationProblems = sequelize.define('consultation_problem', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    consultationId: { type: DataType.INTEGER, allowNull: false, field: 'consultation_id' },
    problemId: { type: DataType.INTEGER, allowNull: false, field: 'problem_id' }
}, { tableName: 'consultation_problems' });

const Notification = sequelize.define<NotificationModelInterface>('notification', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataType.STRING },
    message: { type: DataType.TEXT },
    type: { type: DataType.STRING },
    isRead: { type: DataType.BOOLEAN, defaultValue: false },
    entity: { type: DataType.JSONB, defaultValue: null },
    entityType: { type: DataType.STRING, defaultValue: null },
    userId: { type: DataType.INTEGER, allowNull: false }
});

const ConsultationRoomModel = sequelize.define<ConsulationRoomModelInterface>('consultation_room', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    consultationId: { type: DataType.INTEGER, allowNull: false },
    roomId: { type: DataType.STRING, unique: true },
    status: { type: DataType.STRING, defaultValue: 'PENDING' },
    startTime: { type: DataType.DATE, allowNull: true },
    endTime: { type: DataType.DATE, allowNull: true },
    participants: { type: DataType.JSONB, defaultValue: [] }
});

const BreakModel = sequelize.define<BreakModelInterface>('break', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    startDate: { type: DataType.DATEONLY },
    endDate: { type: DataType.DATEONLY },
    doctorId: { type: DataType.INTEGER }
});

// Таблица работы с контентом на сайте
const ContentModel = sequelize.define<ContentModelInterface>('content', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    label: { type: DataType.STRING, allowNull: true },
    text_content: { type: DataType.TEXT, allowNull: false },
    type: { type: DataType.STRING, allowNull: false }
});

Consultation.hasOne(ConsultationRoomModel, { foreignKey: 'consultationId' });
ConsultationRoomModel.belongsTo(Consultation, { foreignKey: 'consultationId' });

UserModel.hasOne(BasicDataModel);
BasicDataModel.belongsTo(UserModel);

UserModel.hasOne(DoctorModel);
DoctorModel.belongsTo(UserModel);

UserModel.hasOne(Transaction);
Transaction.belongsTo(UserModel);

UserModel.hasOne(UserTelegramModel);
UserTelegramModel.belongsTo(UserModel);

UserModel.hasMany(Notification, { foreignKey: "userId" });
Notification.belongsTo(UserModel, { foreignKey: "userId" });

Consultation.hasOne(Transaction);
Transaction.belongsTo(Consultation);

DoctorModel.hasOne(Consultation);
Consultation.belongsTo(DoctorModel);

DoctorSlots.hasOne(Consultation);
Consultation.belongsTo(DoctorSlots);

UserModel.hasOne(Consultation);
Consultation.belongsTo(UserModel);

DoctorModel.hasMany(DoctorSlots, { foreignKey: "doctorId" });
DoctorSlots.belongsTo(DoctorModel, { foreignKey: "doctorId" });

UserModel.hasOne(TokenModel);
TokenModel.belongsTo(UserModel);

UserModel.hasOne(ProfDataModel);
ProfDataModel.belongsTo(UserModel);

DoctorModel.belongsToMany(SpecializationModel, {
    through: DoctorSpecialization,
    foreignKey: 'doctorId',
    otherKey: 'specializationId'
});

SpecializationModel.belongsToMany(DoctorModel, {
    through: DoctorSpecialization,
    foreignKey: 'specializationId',
    otherKey: 'doctorId'
});

DoctorModel.hasMany(DoctorSpecialization, {
    foreignKey: "doctorId",
    as: "profData"
});

DoctorSpecialization.belongsTo(DoctorModel, {
    foreignKey: "doctorId",
    as: "doctor"
});

DoctorSpecialization.belongsTo(SpecializationModel, { foreignKey: 'specializationId' });

Consultation.belongsToMany(ProblemModel, {
    through: ConsultationProblems,
    foreignKey: 'consultationId',
    otherKey: 'problemId'
});

ProblemModel.belongsToMany(Consultation, {
    through: ConsultationProblems,
    foreignKey: 'problemId',
    otherKey: 'consultationId'
});

export default {
    UserModel,
    DoctorModel,
    Transaction,
    Consultation,
    TokenModel,
    UserTelegramModel,
    DoctorSlots,
    BasicDataModel,
    SpecializationModel,
    ProblemModel,
    DoctorSpecialization,
    ContentModel,
    ConsultationProblems,
    ProfDataModel,
    Notification,
    ConsultationRoomModel,
    BreakModel
}