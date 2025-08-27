import SpecializationRepository from "../repositories/specializations.repository.js";

export default class Doctor {
    constructor(
        public id: number,
        public experienceYears: number,
        public diplomas: string[],
        public licenses: string[],
        public isActivated: boolean,
        public specializations: string[],
        public userId?: number,
        public userName?: string,
        public userSurname?: string,
        public userPatronymic?: string,
        public userAvatar?: string,
        public userGender?: string
    ) { }
}