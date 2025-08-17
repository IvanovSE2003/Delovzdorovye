export default class Batch {
    constructor(
        public readonly id: number,
        public readonly status: string,
        public readonly rejection_reason: string,
        public readonly is_urgent: boolean,
        public readonly field_name: string,
        public readonly old_value: string,
        public readonly new_value: string,
        public readonly userId?: number,
        public userName?: string,
        public userSurname?: string,
        public userPatronymic?: string
    ) {}
}