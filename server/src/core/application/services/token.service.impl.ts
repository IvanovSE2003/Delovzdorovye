import jwt from 'jsonwebtoken';
import ApiError from '../../../infrastructure/web/error/ApiError.js'
import TokenService from '../../domain/services/token.service.js';
import Token from '../../domain/entities/token.entity.js'
import models from '../../../infrastructure/persostence/models/models.js';

const {TokenModel} = models;

class TokenServiceImpl implements TokenService {
    constructor(
        private readonly secretKey: string,
        private readonly refreshKey: string,
        private readonly accessExpiresIn: string = '5m',
        private readonly refreshExpiresIn: string = '24h'
    ) {
        if (!this.secretKey || !this.refreshKey) {
            throw new Error('JWT секретные ключи не настроены');
        }
    }

    async generateTokens(payload: { id: number; email: string; role: string }): Promise<{accessToken: string; refreshToken: string;}> {
        const accessToken = jwt.sign(
            { ...payload, type: 'access' },
            this.secretKey,
            { expiresIn: this.accessExpiresIn } as jwt.SignOptions
        );

        const refreshToken = jwt.sign(
            { ...payload, type: 'refresh' },
            this.refreshKey,
            { expiresIn: this.refreshExpiresIn } as jwt.SignOptions
        );

        return { accessToken, refreshToken };
    }

    validateAccessToken(token: string): { id: number; email: string; role: string } | null {
        try {
            const decoded = jwt.verify(token, this.secretKey) as jwt.JwtPayload;
            
            if (decoded.type !== 'access') {
                throw ApiError.badRequest('Неверный тип токена');
            }

            return {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role
            };
        } catch (e) {
            if (e instanceof jwt.TokenExpiredError) {
                throw ApiError.notAuthorized('Access token просрочен');
            }
            if (e instanceof jwt.JsonWebTokenError) {
                throw ApiError.badRequest('Неверный access token');
            }
            return null;
        }
    }

    validateRefreshToken(token: string): { id: number; email: string; role: string } | null {
        try {
            const decoded = jwt.verify(token, this.refreshKey) as jwt.JwtPayload;
            if (decoded.type !== 'refresh') {
                throw ApiError.badRequest('Не верный тип токена');
            }

            return {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role
            };
        } catch (e) {
            if (e instanceof jwt.TokenExpiredError) {
                throw ApiError.badRequest('Refresh token просрочен');
            }
            if (e instanceof jwt.JsonWebTokenError) {
                throw ApiError.badRequest(e.message);
            }
            return null;
        }
    }

    async saveToken(userId: number, refreshToken: string): Promise<void> {
        const existingToken = await TokenModel.findOne({ where: { userId } });
        
        if (existingToken) {
            await TokenModel.update(
                { refreshToken },
                { where: { userId } }
            );
        } else {
            await TokenModel.create({ refreshToken, userId });
        }
    }

    async removeToken(refreshToken: string): Promise<void> {
        await TokenModel.destroy({where: {refreshToken}});
    }

    async findToken(refreshToken: string): Promise<Token> {
        const tokenData = await TokenModel.findOne({where: {refreshToken}});
        if(!tokenData) {
            throw new Error("Токен не найден");
        }
        return tokenData;
    }
}

export default TokenServiceImpl;