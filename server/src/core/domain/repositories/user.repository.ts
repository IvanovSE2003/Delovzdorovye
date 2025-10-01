import User from "../entities/user.entity.js";

export default interface UserRepository {
    findByEmailOrPhone(credential: string): unknown;
    findById(id: number): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByPhone(phone: string): Promise<User | null>;
    findByDoctorId(doctorId: number): Promise<User | null>;
    findByActivationLink(link: string): Promise<User | null>;
    findByResetToken(resetToken: string): Promise<User | null>;
    findOtherProblem(users: User[]): Promise<User[]>;
    findAll(page?: number, limit?: number, filters?: { role?: string; }): Promise<{ users: User[]; totalCount: number; totalPages: number; }>

    create(user: User): Promise<User>;
    update(user: User): Promise<User>;
    delete(id: number): Promise<void>;
    save(user: User): Promise<User>;    

    checkUserExists(email?: string, phone?: string): Promise<boolean>;
    verifyPinCode(userId: number, pinCode: number): Promise<boolean>;

    hasPendingChanges(userId: number): Promise<boolean>;
    updateField(userId: number, field: string, value: any): Promise<void>;
}