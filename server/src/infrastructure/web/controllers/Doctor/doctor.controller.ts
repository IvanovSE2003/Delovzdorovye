import { Request, Response, NextFunction } from "express";
import AuthService from "../../../../core/domain/services/auth.service.js";
import UserRepository from "../../../../core/domain/repositories/user.repository.js";
import ApiError from "../../error/ApiError.js"
import TokenService from "../../../../core/domain/services/token.service.js";

export default class UserController {
    constructor(
        private readonly authService: AuthService,
        private readonly userRepository: UserRepository,
        private readonly tokenService: TokenService
    ) {}

    async getPatient(req: Request, res: Response, next: NextFunction) {
        const {id} = req.params;
    }

}