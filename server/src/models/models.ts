import sequelize from '../db.js'
import { DataType } from 'sequelize-typescript'
import { IUserModel } from "../interfeces/IUser.js";
import { ITokenModel } from "../interfeces/IToken.js"

const User = sequelize.define<IUserModel>('user', {
    id: {type: DataType.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataType.STRING, allowNull: false},
    surname: {type: DataType.STRING, allowNull: false}, 
    patronymic: {type: DataType.STRING, allowNull: false},
    email: {type: DataType.STRING, unique: true, allowNull: true},
    phone: {type: DataType.STRING, unique: true, allowNull: true},
    pin_code: {type: DataType.INTEGER, allowNull: false},
    password: {type: DataType.STRING, allowNull: false},
    time_zone: {type: DataType.INTEGER, allowNull: false},
    date_birth: {type: DataType.DATEONLY},
    gender: {type: DataType.STRING, allowNull: false},   
    isActivated: {type: DataType.BOOLEAN, defaultValue: false},
    activationLink: {type: DataType.STRING, allowNull: true},
    img: {type: DataType.STRING, defaultValue: "defaultImg.jpg"},
    role: {type: DataType.STRING, defaultValue: "PACIENT"},
    resetPasswordToken:{type: DataType.STRING, allowNull: true},
    resetPasswordExpires:{type: DataType.DATE, allowNull: true}
})

const Token = sequelize.define<ITokenModel>('token', {
    id: {type: DataType.INTEGER, primaryKey: true, autoIncrement: true},
    userId: {type: DataType.INTEGER},
    refreshToken: {type: DataType.TEXT, allowNull: false}
})

const Patient = sequelize.define('patient', {
    id: {type: DataType.INTEGER, primaryKey: true, autoIncrement: true},
    general_info: {type: DataType.JSONB},
    analyses_examinations: {type: DataType.JSONB},
    additionally: {type: DataType.JSONB}
})

const Doctor = sequelize.define('doctor', {
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

const DoctorsSchedule = sequelize.define('doctors_schedule', {
    id: {type: DataType.INTEGER, primaryKey: true, autoIncrement: true},
    date: {type: DataType.DATE},
    day_weekly: {type: DataType.STRING},
    time_start: {type: DataType.TIME, defaultValue: "8:00"},
    time_end: {type: DataType.TIME, defaultValue: "20:00"},
})

const Transaction = sequelize.define('transaction', {
    id: {type: DataType.INTEGER, primaryKey: true, autoIncrement: true},
    sum: {type: DataType.INTEGER},
    status: {type: DataType.STRING},
    date: {type: DataType.DATE}
})

User.hasOne(Doctor)
Doctor.belongsTo(User)

User.hasOne(Patient)
Patient.belongsTo(User)

User.hasOne(Transaction)
Transaction.belongsTo(User)

Consultation.hasOne(Transaction)
Transaction.belongsTo(Consultation)

Patient.hasOne(Consultation)
Consultation.belongsTo(Patient)

Doctor.hasOne(Consultation)
Consultation.belongsTo(Doctor)

Doctor.hasOne(DoctorsSchedule)
DoctorsSchedule.belongsTo(Doctor)

User.hasOne(Token)
Token.belongsTo(User)

export default {
    User,
    Doctor,
    Patient,
    Transaction,
    Consultation,
    DoctorsSchedule,
    Token
}