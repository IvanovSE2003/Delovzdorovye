import User from "../entities/user.entity.js";

export default interface UserService {
    getUserById(id: number): Promise<User>;
    updateUser(
        id: number,
        updateData: {
            email?: string;
            name?: string;
            surname?: string;
            patronymic?: string;
            phone?: string;
            gender?: string;
            dateBirth?: Date;
            timeZone?: number;
            img?: string;
            resetPasswordToken?: string;
            resetPasswordExpires?: string;
        }
    ): Promise<User>;

    checkUserExists(email?: string, phone?: string): Promise<boolean>;
    verifyPinCode(userId: number, pinCode: number): Promise<boolean>;
}