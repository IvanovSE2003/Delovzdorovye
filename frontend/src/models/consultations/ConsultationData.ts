export interface ConsultationData {
    id?: number;
    userId?: number;
    problems?: number[];
    otherProblemText?: string;
    hasOtherProblem?: boolean;
    descriptionProblem?: string;
    date: string | null;
    time: string | null;
    doctorId?: number;
}
