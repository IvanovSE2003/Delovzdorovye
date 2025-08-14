import User from "../entities/user.entity.js";
import { UploadedFile } from 'express-fileupload';

export default interface UserRepository {
    findByEmailOrPhone(credential: string): unknown;
    findById(id: number): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByPhone(phone: string): Promise<User | null>;
    create(user: User): Promise<User>;
    update(user: User): Promise<User>;
    delete(id: number): Promise<void>;
    save(user: User): Promise<User>;
    
    findByActivationLink(link: string): Promise<User | null>;
    findByResetToken(resetToken: string): Promise<User | null>;
    
    checkUserExists(email?: string, phone?: string): Promise<boolean>;
    verifyPinCode(userId: number, pinCode: number): Promise<boolean>;
    uploadAvatar(userId: number, img: UploadedFile): Promise<User>;
}