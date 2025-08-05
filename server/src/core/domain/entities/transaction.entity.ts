export default class Transaction {
    constructor(
        public readonly id: number,
        public readonly sum: number,
        public readonly status: string,
        public readonly date: Date
    ) {}
}