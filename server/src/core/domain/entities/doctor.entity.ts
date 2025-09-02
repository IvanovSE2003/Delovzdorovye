import SpecializationRepository from "../repositories/specializations.repository.js";

export default class Doctor {
    constructor(
        public id: number,
        public experienceYears: number,
        public diploma: string,
        public license: string,
        public isActivated: boolean,
        public specialization: string,
        public userId?: number,
        public userName?: string,
        public userSurname?: string,
        public userPatronymic?: string,
        public userAvatar?: string,
        public userGender?: string
    ) { }
}