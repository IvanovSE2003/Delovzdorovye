import jwt from 'jsonwebtoken';
import ApiError from '../../../infrastructure/web/error/ApiError.js'
import TokenService from '../../domain/services/token.service.js';
import Token from '../../domain/entities/token.entity.js'
import models from '../../../infrastructure/persostence/models/models.js';

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

    validateAccessToken(token: string): any | null {
        try {
            const userData = jwt.verify(token, this.secretKey) as jwt.JwtPayload;
            
            if (userData.type !== 'access') {
                throw ApiError.badRequest('Неверный тип токена');
            }

            return userData;
        } catch (e) {
            return null;
        }
    }

    validateRefreshToken(token: string): any | null {
        try {
            const userData = jwt.verify(token, this.refreshKey) as jwt.JwtPayload;
            if (userData.type !== 'refresh') {
                throw ApiError.badRequest('Не верный тип токена');
            }

            return userData;
        } catch (e) {
            return null;
        }
    }

    async saveToken(userId: number, refreshToken: string): Promise<void> {
        const existingToken = await models.TokenModel.findOne({ where: { userId } });
        
        if (existingToken) {
            await models.TokenModel.update(
                { refreshToken },
                { where: { userId } }
            );
        } else {
            await models.TokenModel.create({ refreshToken, userId });
        }
    }

    async removeToken(refreshToken: string): Promise<void> {
        await models.TokenModel.destroy({where: {refreshToken}});
    }

    async findToken(refreshToken: string): Promise<Token | null> {
        const tokenData = await models.TokenModel.findOne({where: {refreshToken}});
        return tokenData;
    }
}

export default TokenServiceImpl;