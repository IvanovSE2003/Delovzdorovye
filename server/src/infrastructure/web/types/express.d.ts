import { UserPayload } from "../../core/domain/services/token.service"; // Импортируйте тип, если он у вас есть

declare global {
    namespace Express {
        interface Request {
            user?: UserPayload; 
        }
    }
}