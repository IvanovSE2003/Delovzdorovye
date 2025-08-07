import { Op } from 'sequelize';
import UserRepository from "../../domain/repositories/user.repository.js"
import User from '../../domain/entities/user.entity.js';
import Patient from '../../domain/entities/patient.entity.js';
import Doctor from "../../domain/entities/doctor.entity.js";
import models from '../../../infrastructure/persostence/models/models.js';
import {PatientModelInterface} from '../../../infrastructure/persostence/models/interfaces/patient.model.js';
import {UserModelInterface, IUserCreationAttributes} from '../../../infrastructure/persostence/models/interfaces/user.model.js';

const {UserModel, PatientModel, DoctorModel} = models;

export default class UserRepositoryImpl implements UserRepository {
    async findByEmailOrPhone(credential: string): Promise<User | null> {
        const user = await UserModel.findOne({
            where: {
                [Op.or]: [
                    { email: credential },
                    { phone: credential }
                ]
            }
        });
        return user ? this.mapToDomainUser(user) : null;
    }

    async findById(id: number): Promise<User | null> {
        const user = await UserModel.findByPk(id);
        return user ? this.mapToDomainUser(user) : null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await UserModel.findOne({ where: { email } });
        return user ? this.mapToDomainUser(user) : null;
    }

    async findByPhone(phone: string): Promise<User | null> {
        const user = await UserModel.findOne({ where: { phone } });
        return user ? this.mapToDomainUser(user) : null;
    }

    async create(user: User): Promise<User> {
        const createdUser = await UserModel.create(this.mapToPersistence(user));
        return this.mapToDomainUser(createdUser);
    }

    async update(user: User): Promise<User> {
        const [affectedCount, affectedRows] = await UserModel.update(this.mapToPersistence(user),{ where: { id: user.id }, returning: true });
        if (affectedCount === 0 || !affectedRows || affectedRows.length === 0) {
            throw new Error('Пользователь не был обновлен');
        }
        const updatedUser = affectedRows[0];
        return this.mapToDomainUser(updatedUser);
    }

    async save(user: User): Promise<User> {
        return user.id ? this.update(user) : this.create(user);
    }

    async createPatient(userId: number, patientData: Partial<Patient>): Promise<Patient> {
        const patient = await PatientModel.create({ ...patientData as any, userId }) as unknown as PatientModelInterface;
        return new Patient(
            patient.id,
            patient.general_info,
            patient.analyses_examinations,
            patient.additionally,
            patient.activate
        );
    }

    async createDoctor(userId: number, doctorData: Partial<Doctor>): Promise<Doctor> {
        // const doctor = await DoctorModel.create({ ...doctorData, userId }) as unknown as DoctorModelInterface;
        // return new Doctor(
        //     doctor.id,
        //     doctor.specialization,
        //     doctor.contacts,
        //     doctor.experienceYears,
        //     doctor.activate,
        //     doctor.userId
        // );
        throw ""
    }

    async findByActivationLink(link: string): Promise<User | null> {
        const user = await UserModel.findOne({ where: { activationLink: link } });
        return user ? this.mapToDomainUser(user) : null;
    }

    async checkUserExists(email?: string, phone?: string): Promise<boolean> {
        const where: any = {};
        if (email) where.email = email;
        if (phone) where.phone = phone;

        const count = await UserModel.count({ where });
        return count > 0;
    }

    async verifyPinCode(userId: number, pinCode: number): Promise<boolean> {
        const user = await UserModel.findOne({
            where: { id: userId, pin_code: pinCode }
        });
        return !!user;
    }

    private mapToDomainUser(userModel: UserModelInterface): User {
        return new User(
            userModel.id,
            userModel.name,
            userModel.surname,
            userModel.patronymic,
            userModel.email,
            userModel.phone,
            userModel.pin_code,
            userModel.time_zone,
            userModel.date_birth,
            userModel.gender,
            userModel.isActivated,
            userModel.activationLink,
            userModel.img,
            userModel.role,
            userModel.twoFactorCode,
            userModel.twoFactorCodeExpires,
        );
    }

    private mapToPersistence(user: User): IUserCreationAttributes {
        return {
            name: user.name,
            surname: user.surname,
            patronymic: user.patronymic,
            email: user.email,
            phone: user.phone,
            pin_code: user.pinCode,
            time_zone: user.timeZone,
            date_birth: user.dateBirth,
            gender: user.gender,
            isActivated: user.isActivated,
            activationLink: user.activationLink,
            img: user.img,
            role: user.role,
            twoFactorCode: user.twoFactorCode,
            twoFactorCodeExpires: user.twoFactorCodeExpires
        };
    }
}