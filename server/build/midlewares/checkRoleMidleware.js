import jwt from "jsonwebtoken";
export default function roleMiddleware(role) {
    return function authMiddleware(req, res, next) {
        var _a;
        if (req.method === 'OPTIONS') {
            return next();
        }
        try {
            const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
            if (!token) {
                return res.status(401).json({ message: "Пользователь не авторизован!" });
            }
            if (!process.env.SECRET_KEY) {
                throw new Error('SECRET_KEY не установлен');
            }
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            if (typeof decoded === 'object' && decoded !== null &&
                'id' in decoded && 'email' in decoded && 'role' in decoded) {
                const user = decoded;
                if (user.role !== role) {
                    return res.status(403).json({ message: "Нет доступа!" });
                }
                req.user = user;
                next();
            }
            else {
                return res.status(401).json({ message: "Неверный формат токена" });
            }
        }
        catch (e) {
            return res.status(401).json({ message: "Пользователь не авторизован!" });
        }
    };
}
//# sourceMappingURL=checkRoleMidleware.js.map