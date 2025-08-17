export interface Surgery {
  id: number;
  year: number;
  description: string;
}

export interface Allergy {
  id: number;
  type: string;
  description: string;
}

export interface Medication {
  id: number;
  name: string;
  dosage: string;
}

export interface Analysis {
  id: number;
  name: string;
  file: string;
}

export interface Examination {
  id: number;
  name: string;
  file: string;
}

export interface User {
  name: string;
  surname: string;
  patronymic: string;
  gender: string;
  dateBirth: string;
}

export interface MedicalData {
  surgeries: Surgery[];
  allergies: Allergy[];
  medications: Medication[];
  analyses: Analysis[];
  examinations: Examination[];
  user?: User;
}

export interface PatientData {
  id: number;
  isActivated: boolean;
  userId: number;
  medicalData: MedicalData;
}

export interface PatientDataResponse {
  success: boolean;
  data: PatientData[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}