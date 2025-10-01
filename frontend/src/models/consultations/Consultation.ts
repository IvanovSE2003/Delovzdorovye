export interface Consultation {
    id: number;
    durationTime: string;
    date: string;
    DoctorId: number;
    DoctorName: string;
    DoctorSurname: string;
    DoctorPatronymic?: string;
    DoctorUserId: number;
    PatientUserId: number;
    PatientName: string;
    PatientSurname: string;
    PatientPatronymic?: string;
    PatientPhone: string;
    PatientScore: number;
    PatientComment: string;
    Problems: string[];
    score?: number;
    comment?: string;
    reason_cancel?: string;
    recommendations?: string;
    other_problem?: string;
}