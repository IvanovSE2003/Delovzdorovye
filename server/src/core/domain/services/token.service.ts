import Token from '../entities/token.entity.js'

export default interface TokenService {
    generateTokens(payload: { id: number; email: string; role: string }): Promise<{accessToken: string; refreshToken: string; }>;
    removeToken(token: string): Promise<void>;
    findToken(token: string): Promise<Token>
    saveToken(id: number, refreshToken: string): Promise<void>
    validateAccessToken(token: string): { id: number; email: string; role: string } | null;
    validateRefreshToken(token: string): { id: number; email: string; role: string } | null;
}