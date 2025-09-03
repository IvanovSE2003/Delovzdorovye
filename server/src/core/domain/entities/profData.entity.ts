export default class ProfData {
    constructor(
        public id: number,
        public new_diploma: string,
        public new_license: string,
        public new_experience_years: number,
        public new_specialization: string,
        public comment: string | null,
        public type: "ADD" | "DELETE",
        public userId?: number | null
    ) {}
}