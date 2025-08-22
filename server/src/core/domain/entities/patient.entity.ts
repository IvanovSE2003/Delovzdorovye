export default class Patient {
    constructor(
        public id: number,
        public isActivated: boolean,
        public userId?: number,
        public medicalData?: PatientMedicalData
    ) {}

    get chronicDiseases() {
        return this.medicalData?.chronicDiseases || [];
    }

    get surgeries() {
        return this.medicalData?.surgeries || [];
    }

    get allergies() {
        return this.medicalData?.allergies || [];
    }

    get medications() {
        return this.medicalData?.medications || [];
    }

    get analyses() {
        return this.medicalData?.analyses || [];
    }

    get examinations() {
        return this.medicalData?.examinations || [];
    }

    get hereditaryDiseases() {
        return this.medicalData?.hereditaryDiseases || [];
    }

    get user() {
        return this.medicalData?.user;
    }

    activate(): Patient {
        this.isActivated = true;
        return this;
    }
}

export interface PatientMedicalData {
    chronicDiseases?: Array<{ id?: number; name: string }>;
    surgeries?: Array<{ id?: number; year: number; description: string }>;
    allergies?: Array<{ id?: number; type: string; description: string }>;
    medications?: Array<{ id?: number; name: string; dosage: string }>;
    analyses?: Array<{ id?: number; name: string; file: string }>;
    examinations?: Array<{ id?: number; name: string; file: string }>;
    hereditaryDiseases?: Array<{ id?: number; name: string }>;
    user?: {
        name: string;
        surname: string;
        patronymic: string;
        gender: string;
        dateBirth: string;
    };
}