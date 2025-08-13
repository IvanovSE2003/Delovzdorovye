import { Request, Response, NextFunction } from "express";
import DoctorRepository from "../../../../core/domain/repositories/doctor.repository.js";
import ApiError from "../../error/ApiError.js";

export default class DoctorController {
    constructor(
        private readonly doctorRepository: DoctorRepository
    ) {}

    
}