export default class ProfData {
    constructor(
        public id?: number | null,
        public new_diploma?: string | null,
        public new_license?: string | null,
        public new_experience_years?: number | null,
        public new_specialization?: string | null,
        public comment?: string | null,
        public type?: "ADD" | "DELETE" | null,
        public userId?: number | null
    ) {}
}