export default class Batch {
    constructor(
        public readonly id: number,
        public readonly status: string,
        public readonly rejection_reason: string,
        public readonly is_urgent: boolean,
        public readonly changeData?: Array<{ id?: number; field_name: string, old_value: string, new_value: string}>
    ) {}
}
