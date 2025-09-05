import User from "../entities/user.entity.js";
import { UploadedFile } from 'express-fileupload';

export default interface UserRepository {
    findByEmailOrPhone(credential: string): unknown;
    findById(id: number): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByPhone(phone: string): Promise<User | null>;
    findByDoctorId(doctorId: number): Promise<User | null>;
    findAll(page: number,limit: number, filters?: {
                role?: string;
            }
        ): Promise<{
            users: User[];
            totalCount: number;
            totalPages: number;
        }> 
    create(user: User): Promise<User>;
    update(user: User): Promise<User>;
    delete(id: number): Promise<void>;
    save(user: User): Promise<User>;
    
    findByActivationLink(link: string): Promise<User | null>;
    findByResetToken(resetToken: string): Promise<User | null>;

    getAll(): Promise<User[]>;
    
    checkUserExists(email?: string, phone?: string): Promise<boolean>;
    verifyPinCode(userId: number, pinCode: number): Promise<boolean>;
    uploadAvatar(userId: number, fileName: string): Promise<User>;
    deleteAvatar(userId: number): Promise<User>;
}