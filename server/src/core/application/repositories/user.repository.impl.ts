import { Op } from 'sequelize';
import UserRepository from "../../domain/repositories/user.repository.js"
import User from '../../domain/entities/user.entity.js';
import models from '../../../infrastructure/persostence/models/models.js';
import {UserModelInterface, IUserCreationAttributes} from '../../../infrastructure/persostence/models/interfaces/user.model.js';
import { v4 } from 'uuid';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { UploadedFile } from 'express-fileupload';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const {UserModel} = models;

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

    async findByDoctorId(doctorId: number): Promise<User | null> {
        const doctor = await models.DoctorModel.findByPk(doctorId);
        const user = await UserModel.findOne({where: { id: doctor?.userId }});
        return user ? this.mapToDomainUser(user): null;
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

    async delete(id: number): Promise<void> {
        const deletedCount = await UserModel.destroy({ where: { id } });
        if (deletedCount === 0) {
            throw new Error('Пользователь не найден или не был удален');
        }
    }

    async save(user: User): Promise<User> {
        return user.id ? await this.update(user) : await this.create(user);
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

    async findByResetToken(resetToken: string): Promise<User | null> {
        const user = await UserModel.findOne({ 
            where: { 
                resetToken,
                resetTokenExpires: { [Op.gt]: new Date() }
            }
        });
        return user ? this.mapToDomainUser(user) : null;
    }

    async uploadAvatar(userId: number, img: UploadedFile): Promise<User> {
        const ext = path.extname(img.name); 
        const fileName = v4() + ext;
        const filePath = path.resolve(__dirname, '..', '..', '..', '..','static', fileName);
        
        await img.mv(filePath); 

        const user = await this.findById(userId);
        if (!user) {
            throw new Error('Пользователь не найден');
        }

        if (user.img !== 'man.png' && user.img !== 'girl.png') {
            const oldAvatarPath = path.resolve(__dirname, '..', '..', '..', '..', 'static', user.img);
            try {
                await fs.unlink(oldAvatarPath); 
            } catch (err) {
                console.error('Ошибка при удалении старого аватара:', err);
            }
        }
        const userUpdate = await this.save(user.updateAvatar(fileName));
        return userUpdate;
    }

    async deleteAvatar(userId: number): Promise<User> {
        const user = await this.findById(userId);
        if (!user) {
            throw new Error('Пользователь не найден');
        }

        let userDelete;

        if (user.img !== 'man.png' && user.img !== 'girl.png')  {
            const oldAvatarPath = path.resolve(__dirname, '..', '..', '..', '..', 'static', user.img);
            try {
                await fs.unlink(oldAvatarPath); 
            } catch (err) {
                console.error('Ошибка при удалении старого аватара:', err);
            }
        } else {
            userDelete = user;
        }


        if(user.gender === 'Женщина') {
            userDelete = await this.save(user.updateAvatar("girl.png"));
        } else {
            userDelete = await this.save(user.updateAvatar("man.png"));
        }

        return userDelete;
    }

    async getAll(): Promise<User[]> {
        const users = await UserModel.findAll();
        return users.map(user => this.mapToDomainUser(user));
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
            userModel.isActivatedSMS,
            userModel.activationLink,
            userModel.img,
            userModel.role,
            userModel.twoFactorCode,
            userModel.twoFactorCodeExpires,
            userModel.resetToken,
            userModel.resetTokenExpires,
            userModel.pinAttempts, 
            userModel.isBlocked,
            userModel.blockedUntil,
            userModel.sentChanges,
            userModel.isAnonymous
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
            isActivatedSMS: user.isActivatedSMS,
            activationLink: user.activationLink,
            img: user.img,
            role: user.role,
            twoFactorCode: user.twoFactorCode,
            twoFactorCodeExpires: user.twoFactorCodeExpires,
            resetToken: user.resetToken,
            resetTokenExpires: user.resetTokenExpires,
            pinAttempts: user.pinAttempts,
            isBlocked: user.isBlocked,
            blockedUntil: user.blockedUntil,
            sentChanges: user.sentChanges,
            isAnonymous: user.isAnonymous
        };
    }
}