import { Op } from 'sequelize';
import UserRepository from "../../domain/repositories/user.repository.js"
import User from '../../domain/entities/user.entity.js';
import models from '../../../infrastructure/persostence/models/models.js';
import { UserModelInterface, IUserCreationAttributes } from '../../../infrastructure/persostence/models/interfaces/user.model.js';
import ApiError from '../../../infrastructure/web/error/ApiError.js';

export default class UserRepositoryImpl implements UserRepository {
    async findByEmailOrPhone(credential: string): Promise<User | null> {
        const user = await models.UserModel.findOne({
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
        const user = await models.UserModel.findByPk(id);
        return user ? this.mapToDomainUser(user) : null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await models.UserModel.findOne({ where: { email } });
        return user ? this.mapToDomainUser(user) : null;
    }

    async findByPhone(phone: string): Promise<User | null> {
        const user = await models.UserModel.findOne({ where: { phone } });
        return user ? this.mapToDomainUser(user) : null;
    }

    async findByDoctorId(doctorId: number): Promise<User | null> {
        const doctor = await models.DoctorModel.findByPk(doctorId);
        const user = await models.UserModel.findOne({ where: { id: doctor?.userId } });
        return user ? this.mapToDomainUser(user) : null;
    }

    async findOtherProblem(users: User[]): Promise<User[]> {
        const userIds = users.map(user => user.id);

        if (userIds.length === 0) {
            return [];
        }

        const usersWithOtherProblems = await models.UserModel.findAll({
            include: [{
                model: models.OtherProblem,
                required: true,
                attributes: []
            }],
            where: {
                id: {
                    [Op.in]: userIds
                }
            }
        });

        return usersWithOtherProblems.map(user => this.mapToDomainUser(user));
    }

    async findAll(
        page?: number,
        limit?: number,
        filters?: {
            role?: string;
        }
    ): Promise<{
        users: User[];
        totalCount: number;
        totalPages: number;
    }> {
        const where: any = {};

        if (filters?.role) {
            where.role = filters.role;
        }

        const totalCount = await models.UserModel.count({ where });

        let users;
        let totalPages = 1;

        if (page && limit) {
            // с пагинацией
            totalPages = Math.ceil(totalCount / limit);

            users = await models.UserModel.findAll({
                where,
                limit,
                offset: (page - 1) * limit,
                order: [["id", "ASC"]],
            });
        } else {
            users = await models.UserModel.findAll({
                where,
                order: [["id", "ASC"]],
            });
        }

        return {
            users: users.map((user) => this.mapToDomainUser(user)),
            totalCount,
            totalPages,
        };
    }

    async create(user: User): Promise<User> {
        const createdUser = await models.UserModel.create(this.mapToPersistence(user));
        return this.mapToDomainUser(createdUser);
    }

    async update(user: User): Promise<User> {
        const [affectedCount, affectedRows] = await models.UserModel.update(this.mapToPersistence(user), { where: { id: user.id }, returning: true });
        if (affectedCount === 0 || !affectedRows || affectedRows.length === 0) {
            throw new Error('Пользователь не был обновлен');
        }
        const updatedUser = affectedRows[0];
        return this.mapToDomainUser(updatedUser);
    }

    async delete(id: number): Promise<void> {
        const deletedCount = await models.UserModel.destroy({ where: { id } });
        if (deletedCount === 0) {
            throw new Error('Пользователь не найден или не был удален');
        }
    }

    async save(user: User): Promise<User> {
        return user.id ? await this.update(user) : await this.create(user);
    }

    async findByActivationLink(link: string): Promise<User | null> {
        const user = await models.UserModel.findOne({ where: { activationLink: link } });
        return user ? this.mapToDomainUser(user) : null;
    }

    async checkUserExists(email?: string, phone?: string): Promise<boolean> {
        const where: any = {};
        if (email) where.email = email;
        if (phone) where.phone = phone;

        const count = await models.UserModel.count({ where });
        return count > 0;
    }

    async verifyPinCode(userId: number, pinCode: number): Promise<boolean> {
        const user = await models.UserModel.findOne({
            where: { id: userId, pin_code: pinCode }
        });
        return !!user;
    }

    async findByResetToken(resetToken: string): Promise<User | null> {
        const user = await models.UserModel.findOne({
            where: {
                resetToken,
                resetTokenExpires: { [Op.gt]: new Date() }
            }
        });
        return user ? this.mapToDomainUser(user) : null;
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