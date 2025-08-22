export default class Batch {
    constructor(
        public id: number,
        public status: string,
        public rejection_reason: string,
        public is_urgent: boolean,
        public field_name: string,
        public old_value: string,
        public new_value: string,
        public userId?: number,
        public userName?: string,
        public userSurname?: string,
        public userPatronymic?: string
    ) {}

    setStatus(status: string) {
        this.status = status;
        return this;
    }
}