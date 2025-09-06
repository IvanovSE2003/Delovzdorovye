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

const DoctorSlots = sequelize.define<TimeSlotmModelInterface>('time_slot', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    time: { type: DataType.TIME },
    date: {type: DataType.DATEONLY},
    isRecurring: {type: DataType.BOOLEAN, defaultValue: false},
    dayWeek: {type: DataType.INTEGER},
    status: { type: DataType.STRING},
});

const Consultation = sequelize.define<ConsultationModelInterface>('consultation', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    consultation_status: { type: DataType.STRING },
    payment_status: { type: DataType.STRING },
    other_problem: { type: DataType.TEXT, allowNull: true },
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

const ModerationBatchModel = sequelize.define<BatchModelInterface>('basic_data_records', {
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
    new_experience_years: { type: DataType.INTEGER },
    comment: { type: DataType.TEXT, allowNull: true },
    type: { type: DataType.STRING, defaultValue: 'ADD' }
});

const DoctorSpecialization = sequelize.define('doctor_specializations', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    diploma: { type: DataType.STRING, allowNull: true },
    license: { type: DataType.STRING, allowNull: true },
    doctorId: { type: DataType.INTEGER, allowNull: false, references: { model: DoctorModel, key: 'id' } },
    specializationId: { type: DataType.INTEGER, allowNull: false, references: { model: SpecializationModel, key: 'id' } }
});


const ProblemSpecialization = sequelize.define('problem_specializations', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true }
});

const ConsultationProblems = sequelize.define('consultation_problems', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    consultationId: { type: DataType.INTEGER, allowNull: false, field: 'consultation_id' },
    problemId: { type: DataType.INTEGER, allowNull: false, field: 'problem_id' }
}, {
    tableName: 'consultation_problems'
});


// Таблицы с контентом на сайте

const ContentModel = sequelize.define('content', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    type: { type: DataType.STRING, allowNull: false },
    text_content: { type: DataType.TEXT, allowNull: false }
});

const ContentWithTitleModel = sequelize.define('content_with_title', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    label: { type: DataType.STRING, allowNull: false },
    text_content: { type: DataType.TEXT, allowNull: false },
    type: { type: DataType.STRING, allowNull: false }
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

DoctorSlots.hasOne(Consultation)
Consultation.belongsTo(DoctorSlots)

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

DoctorSpecialization.belongsTo(DoctorModel, { foreignKey: 'doctorId' });
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
    ModerationBatchModel,
    SpecializationModel,
    ProblemModel,
    DoctorSpecialization,
    ProblemSpecialization,
    ContentModel,
    ContentWithTitleModel,
    ConsultationProblems,
    ProfDataModel
}