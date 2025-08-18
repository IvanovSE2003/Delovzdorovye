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
    experienceYears: number
    diploma: string,
    license: string,
    isAnonymous: boolean
}