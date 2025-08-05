export default class Token {
    constructor(
        public readonly id: number,
        public readonly userId: number,
        public readonly refreshToken: string
    ) {}
}