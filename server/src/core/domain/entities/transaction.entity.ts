export default class Transaction {
    constructor(
        public id: number,
        public sum: number,
        public status: string,
        public date: Date
    ) {}
}