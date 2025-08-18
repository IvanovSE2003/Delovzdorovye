import User from "../../../core/domain/entities/user.entity.js";

export default interface dataResult {
    user: User; 
    accessToken: string; 
    refreshToken: string;
    requiresTwoFactor?: boolean;
    tempToken?: string;
}