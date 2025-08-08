import User from "../entities/user.entity.js";
import Patient from "../entities/patient.entity.js";
import Doctor from "../entities/doctor.entity.js";

export default interface UserRepository {
    findByEmailOrPhone(credential: string): unknown;
    findById(id: number): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByPhone(phone: string): Promise<User | null>;
    create(user: User): Promise<User>;
    update(user: User): Promise<User>;
    save(user: User): Promise<User>;
    
    findByActivationLink(link: string): Promise<User | null>;
    
    checkUserExists(email?: string, phone?: string): Promise<boolean>;
    verifyPinCode(userId: number, pinCode: number): Promise<boolean>;
}