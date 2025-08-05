import Token from "../entities/token.entity.js";

export default interface TokenRepository {
    saveToken(userId: number, refreshToken: string): Promise<Token>;
    removeToken(refreshToken: string): Promise<boolean>;
    findToken(refreshToken: string): Promise<Token | null>;
}