import sequelize from '../db/db.js'
import { DataType } from 'sequelize-typescript'
import { UserModelInterface } from "../models/interfaces/user.model.js"
import {PatientModelInterface} from './interfaces/patient.model.js'
import { TelegramModelInterface } from './interfaces/telegram.model.js'
import { DoctorModelInterface } from './interfaces/doctor.model.js'
import { TokenModelInterface } from './interfaces/token.model.js'
import { DoctorScheduleModelInterface } from './interfaces/doctorSchedule.model.js'

const UserModel = sequelize.define<UserModelInterface>('user', {
    id: {type: DataType.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataType.STRING, allowNull: false},
    surname: {type: DataType.STRING, allowNull: false}, 
    patronymic: {type: DataType.STRING, allowNull: false},
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
    blockedUntil: {type: DataType.DATE, allowNull: true}
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

// Хронические заболевания
const ChronicDiseaseModel = sequelize.define('chronic_disease', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataType.STRING }
});

// Операции
const SurgeryModel = sequelize.define('surgery', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    year: { type: DataType.INTEGER },
    description: { type: DataType.TEXT }
});

// Аллергии
const AllergyModel = sequelize.define('allergy', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    type: { type: DataType.STRING }, 
    description: { type: DataType.TEXT }
});

// Регулярные лекарства
const MedicationModel = sequelize.define('medication', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataType.STRING },
    dosage: { type: DataType.STRING }
});

// Анализы
const AnalysisModel = sequelize.define('analysis', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataType.STRING },
    file: { type: DataType.STRING } 
});

// Исследования
const ExaminationModel = sequelize.define('examination', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataType.STRING },
    file: { type: DataType.STRING } 
});

// Наследственные заболевания
const HereditaryDiseaseModel = sequelize.define('hereditary_disease', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataType.STRING }
});

const DoctorModel = sequelize.define<DoctorModelInterface>('doctor', {
    id: {type: DataType.INTEGER, primaryKey: true, autoIncrement: true},
    specialization: {type: DataType.STRING},
    contacts: {type: DataType.STRING, allowNull: true},
    experience_years: {type: DataType.INTEGER},
    activate: {type: DataType.BOOLEAN, defaultValue: false}
});

const Consultation = sequelize.define('consultation', {
    id: {type: DataType.INTEGER, primaryKey: true, autoIncrement: true},
    datatime_consult: {type: DataType.DATE},
    status: {type: DataType.STRING, defaultValue: "expectation"},
    problems_data: {type: DataType.JSONB},
    recommendations: {type: DataType.TEXT},
    duration: {type: DataType.INTEGER, allowNull: true}
})

const DoctorsSchedule = sequelize.define<DoctorScheduleModelInterface>('doctors_schedule', {
    id: {type: DataType.INTEGER, primaryKey: true, autoIncrement: true},
    date: {type: DataType.DATEONLY},
    day_weekly: {type: DataType.STRING},
    time_start: {type: DataType.TIME, defaultValue: "8:00"},
    time_end: {type: DataType.TIME, defaultValue: "20:00"},
})

const TimeSlot = sequelize.define('time_slot', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    time: { type: DataType.TIME },
    is_available: { type: DataType.BOOLEAN, defaultValue: true } 
});

const Transaction = sequelize.define('transaction', {
    id: {type: DataType.INTEGER, primaryKey: true, autoIncrement: true},
    sum: {type: DataType.INTEGER},
    status: {type: DataType.STRING},
    date: {type: DataType.DATE}
})

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

PatientModel.hasMany(ChronicDiseaseModel);
ChronicDiseaseModel.belongsTo(PatientModel);

PatientModel.hasMany(SurgeryModel);
SurgeryModel.belongsTo(PatientModel);

PatientModel.hasMany(AllergyModel);
AllergyModel.belongsTo(PatientModel);

PatientModel.hasMany(MedicationModel);
MedicationModel.belongsTo(PatientModel);

PatientModel.hasMany(AnalysisModel);
AnalysisModel.belongsTo(PatientModel);

PatientModel.hasMany(ExaminationModel);
ExaminationModel.belongsTo(PatientModel);

PatientModel.hasMany(HereditaryDiseaseModel);
HereditaryDiseaseModel.belongsTo(PatientModel);

DoctorsSchedule.hasMany(TimeSlot);
TimeSlot.belongsTo(DoctorsSchedule);

export default {
    UserModel,
    DoctorModel,
    PatientModel,
    Transaction,
    Consultation,
    DoctorsSchedule,
    TokenModel,
    UserTelegramModel,
    ChronicDiseaseModel,
    SurgeryModel,
    AllergyModel,
    MedicationModel,
    AnalysisModel,
    ExaminationModel,
    HereditaryDiseaseModel,
    TimeSlot
}