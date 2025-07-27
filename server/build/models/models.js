import sequelize from '../db.js';
import { DataType } from 'sequelize-typescript';
const User = sequelize.define('user', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataType.STRING },
    surname: { type: DataType.STRING },
    patronymic: { type: DataType.STRING },
    email: { type: DataType.STRING, unique: true },
    phone: { type: DataType.STRING, unique: true },
    pin_code: { type: DataType.INTEGER },
    password: { type: DataType.STRING },
    time_zone: { type: DataType.INTEGER },
    date_birth: { type: DataType.DATEONLY },
    gender: { type: DataType.STRING },
    role: { type: DataType.STRING, defaultValue: "PACIENT" }
});
const Patient = sequelize.define('patient', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    general_info: { type: DataType.JSONB },
    analyses_examinations: { type: DataType.JSONB },
    additionally: { type: DataType.JSONB }
});
const Doctor = sequelize.define('doctor', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    specialization: { type: DataType.STRING },
    contacts: { type: DataType.STRING, allowNull: true },
    experience_years: { type: DataType.INTEGER }
});
const Consultation = sequelize.define('consultation', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    datatime_consult: { type: DataType.DATE },
    status: { type: DataType.STRING, defaultValue: "expectation" },
    problems_data: { type: DataType.JSONB },
    recommendations: { type: DataType.TEXT },
    duration: { type: DataType.INTEGER, allowNull: true }
});
const DoctorsSchedule = sequelize.define('doctors_schedule', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    date: { type: DataType.DATE },
    day_weekly: { type: DataType.STRING },
    time_start: { type: DataType.TIME, defaultValue: "8:00" },
    time_end: { type: DataType.TIME, defaultValue: "20:00" },
});
const Transaction = sequelize.define('transaction', {
    id: { type: DataType.INTEGER, primaryKey: true, autoIncrement: true },
    sum: { type: DataType.INTEGER },
    status: { type: DataType.STRING },
    date: { type: DataType.DATE }
});
User.hasOne(Doctor);
Doctor.belongsTo(User);
User.hasOne(Patient);
Patient.belongsTo(User);
User.hasOne(Transaction);
Transaction.belongsTo(User);
Consultation.hasOne(Transaction);
Transaction.belongsTo(Consultation);
Patient.hasOne(Consultation);
Consultation.belongsTo(Patient);
Doctor.hasOne(Consultation);
Consultation.belongsTo(Doctor);
Doctor.hasOne(DoctorsSchedule);
DoctorsSchedule.belongsTo(Doctor);
export default {
    User,
    Doctor,
    Patient,
    Transaction,
    Consultation,
    DoctorsSchedule
};
//# sourceMappingURL=models.js.map