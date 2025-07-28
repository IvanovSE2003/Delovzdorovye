import ApiError from "../error/ApiError.js";
import jwt from "jsonwebtoken";
export default function authMiddleware(req, res, next) {
    var _a;
    if (req.method === 'OPTIONS') {
        return next();
    }
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            return next(ApiError.notAuthorized('Пользователь не авторизирован'));
        }
        if (!process.env.SECRET_KEY) {
            throw new Error('SECRET_KEY не установлен');
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        if (typeof decoded === 'object' && decoded !== null &&
            'id' in decoded && 'email' in decoded && 'role' in decoded) {
            req.user = decoded;
            next();
        }
        else {
            return next(ApiError.tokenInvalid('Не верный формат токена'));
        }
        next();
    }
    catch (e) {
        return next(ApiError.notAuthorized('Пользователь не авторизирован'));
    }
}
//# sourceMappingURL=authMidleware.js.map