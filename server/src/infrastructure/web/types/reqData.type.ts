export default interface regData {
    email: string,
    role: 'PATIENT' | 'DOCTOR' | 'ADMIN',
    name: string,
    surname: string,
    patronymic: string,
    phone: string,
    pinCode: number,
    gender: string,
    dateBirth: Date,
    timeZone: number,
    specialization: string,
    contacts: string,
    experienceYears: number
}