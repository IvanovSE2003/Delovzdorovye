// interfaces/patient-medical-data.interface.ts
export interface ChronicDisease {
    id?: number;
    name: string;
}

export interface Surgery {
    id?: number;
    year: number;
    description: string;
}

export interface Allergy {
    id?: number;
    type: string;
    description: string;
}

export interface Medication {
    id?: number;
    name: string;
    dosage: string;
}

export interface Analysis {
    id?: number;
    name: string;
    file: string;
}

export interface Examination {
    id?: number;
    name: string;
    file: string;
}

export interface HereditaryDisease {
    id?: number;
    name: string;
}

export interface PatientUserData {
    name: string;
    surname: string;
    patronymic: string;
    gender: string;
    dateBirth: string;
}

export interface PatientMedicalData {
    chronicDiseases?: ChronicDisease[];
    surgeries?: Surgery[];
    allergies?: Allergy[];
    medications?: Medication[];
    analyses?: Analysis[];
    examinations?: Examination[];
    hereditaryDiseases?: HereditaryDisease[];
    user?: PatientUserData;
}