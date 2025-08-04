import { metadata } from "reflect-metadata/no-conflict";

interface IUserModel {
    id: number;
    email: string;
    name: string;
    surname: string;
    patronymic: string;
    phone: string;
    time_zone: number;
    date_birth: Date;
    gender: string;
    role: string;
    isActivated: Boolean;
}

export default class UserDto {
    id: number;
    email: string;
    name: string;
    surname: string;
    patronymic: string;
    phone: string;
    time_zone: number;
    date_birth: Date;
    gender: string;
    role: string;
    isActivated: Boolean;

    constructor(model : IUserModel) {
        this.id = model.id;
        this.email = model.email;
        this.name = model.name;
        this.surname = model.surname;
        this.patronymic = model.patronymic;
        this.phone = model.phone;
        this.time_zone = model.time_zone;
        this.date_birth = model.date_birth;
        this.gender = model.gender;
        this.role = model.role;
        this.isActivated = model.isActivated
    }
}