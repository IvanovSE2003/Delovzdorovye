export default class Patient {
    constructor(
        public readonly id: number,
        public readonly generalInfo: Record<string, any> | null,
        public readonly analysesExaminations: Record<string, any> | null,
        public readonly additionally: Record<string, any> | null,
        public readonly activate: boolean
    ) {}
}