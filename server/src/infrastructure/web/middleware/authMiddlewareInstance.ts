import TokenServiceImpl from "../../../core/application/services/token.service.impl.js";
import authMiddleware from "./authMidleware.js";

const tokenService = new TokenServiceImpl(
    process.env.SECRET_KEY_ACCESS!,
    process.env.SECRET_KEY_REFRESH!,
    '15m',
    '24h'
);

const authMiddlewareInstance = authMiddleware(tokenService);
export default authMiddlewareInstance;
