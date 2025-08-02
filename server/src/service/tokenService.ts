import jwt from 'jsonwebtoken'
import models from '../models/models.js'

const {Token} = models;

class TokenService {
    static generateTokens(payload: object) {
        const accessToken = jwt.sign(
            payload,
            process.env.SECRET_KEY as string,
            { expiresIn: '10m' }
        );
        const refreshToken = jwt.sign(
            payload,
            process.env.REFRESH_KEY as string,
            { expiresIn: '24h' }
        );
        return { accessToken, refreshToken };
    }

    

    static async saveToken(userId: number, refreshToken: string) {
        const tokenData = await Token.findOne({where: {userId} as any})
        if(tokenData) {
            tokenData.refreshToken = refreshToken;
            return tokenData.save()
        }
        const token = await Token.create({userId, refreshToken})
        return token;
    }

    static async removeToken(refreshToken: string) {
        const tokenData = await Token.destroy({where: {refreshToken}})
        return tokenData;
    }

    static async validateAccessToken(token: string) {
        try {
            const userData = jwt.verify(token, process.env.SECRET_KEY as string);
            return userData;
        } catch (e) {
            return null;
        }
    }

    static async validateRefreshToken(token: string) {
        try {
            const userData = jwt.verify(token, process.env.REFRESH_KEY as string);
            return userData;
        } catch (e) {
            return null;
        }
    }

    static async findToken(refreshToken: string) {
        const tokenData = await Token.findOne({where: {refreshToken}})
        return tokenData;
    }
}

export default TokenService;  